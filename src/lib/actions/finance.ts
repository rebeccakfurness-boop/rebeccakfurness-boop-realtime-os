"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBankFeedClient } from "@/lib/integrations/bank-feed";
import { createStorageClient } from "@/lib/integrations/storage";
import type { InvoiceStatus, BillStatus } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") throw new Error("Staff only");
  return session.user;
}

export interface LineItem {
  description: string;
  amount: number;
}

export async function createInvoice(input: { orgId: string; lineItems: LineItem[]; dueDate: string; status: InvoiceStatus }) {
  await requireStaff();
  const amountNzd = input.lineItems.reduce((sum, item) => sum + item.amount, 0);

  const invoice = await prisma.invoice.create({
    data: {
      orgId: input.orgId,
      lineItems: input.lineItems as unknown as object,
      amountNzd,
      dueDate: new Date(input.dueDate),
      status: input.status,
    },
  });

  if (input.status === "sent" || input.status === "paid") {
    await prisma.organisation.update({ where: { id: input.orgId }, data: { invoiced: true } });
  }
  await prisma.activity.create({
    data: { orgId: input.orgId, type: "invoice", summary: `Invoice for $${amountNzd.toFixed(2)} NZD created (${input.status}).` },
  });

  revalidatePath("/staff/finance");
  revalidatePath(`/staff/crm/${input.orgId}`);
  return { id: invoice.id };
}

export async function updateInvoiceStatus(input: { invoiceId: string; status: InvoiceStatus }) {
  await requireStaff();
  const invoice = await prisma.invoice.update({ where: { id: input.invoiceId }, data: { status: input.status } });

  if (input.status === "paid") {
    await prisma.organisation.update({
      where: { id: invoice.orgId },
      data: { invoiced: true, paidStatus: "paid", pipelineStage: "paid" },
    });
    await prisma.activity.create({
      data: { orgId: invoice.orgId, type: "invoice", summary: `Invoice for $${Number(invoice.amountNzd).toFixed(2)} NZD marked paid.` },
    });
  } else if (input.status === "sent") {
    await prisma.organisation.update({ where: { id: invoice.orgId }, data: { invoiced: true } });
  }

  revalidatePath("/staff/finance");
  revalidatePath(`/staff/finance/invoices/${input.invoiceId}`);
  revalidatePath(`/staff/crm/${invoice.orgId}`);
  revalidatePath("/staff/pipeline");
}

export async function createBill(formData: FormData) {
  await requireStaff();
  const supplier = String(formData.get("supplier") ?? "");
  const amountNzd = Number(formData.get("amountNzd") ?? 0);
  const dueDate = String(formData.get("dueDate") ?? "");
  const file = formData.get("file") as File | null;

  if (!supplier || !amountNzd || !dueDate) return { error: "Supplier, amount and due date are required." };

  let fileUrl: string | undefined;
  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await createStorageClient().uploadFile({ filename: file.name, buffer: bytes, contentType: file.type });
    fileUrl = uploaded.url;
  }

  await prisma.bill.create({ data: { supplier, amountNzd, dueDate: new Date(dueDate), fileUrl } });
  revalidatePath("/staff/finance");
  return { ok: true };
}

export async function updateBillStatus(input: { billId: string; status: BillStatus }) {
  await requireStaff();
  await prisma.bill.update({ where: { id: input.billId }, data: { status: input.status } });
  revalidatePath("/staff/finance");
}

/**
 * Pulls transactions from the live bank-feed integration (Xero once connected).
 * Returns 0 against the mock client, since a live feed isn't wired up yet, in
 * which case CSV import below remains the primary way to populate the ledger.
 */
export async function syncBankFeed() {
  await requireStaff();
  const client = createBankFeedClient();
  const transactions = await client.fetchTransactions(30);
  if (transactions.length > 0) {
    await prisma.bankTransaction.createMany({ data: transactions });
    revalidatePath("/staff/finance");
  }
  return { count: transactions.length };
}

/**
 * Manual CSV import for the bank feed. Expected columns: date,description,amount[,category].
 * A negative amount is treated as money out, positive as money in. This is the same shape
 * a live Xero/bank-feed adapter would populate, see src/lib/integrations/bank-feed.ts.
 */
export async function importBankCsv(formData: FormData) {
  await requireStaff();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a CSV file first." };

  const text = await file.text();
  const rows = text
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter(Boolean);

  if (rows.length === 0) return { error: "The file is empty." };

  const header = rows[0].toLowerCase();
  const dataRows = header.includes("date") ? rows.slice(1) : rows;

  const transactions = dataRows
    .map((row) => {
      const [date, description, amountRaw, category] = row.split(",").map((c) => c.trim());
      const amount = Number(amountRaw);
      if (!date || Number.isNaN(amount)) return null;
      return {
        date: new Date(date),
        description: description || "Uncategorised",
        amountNzd: Math.abs(amount),
        direction: amount < 0 ? ("out" as const) : ("in" as const),
        category: category || undefined,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (transactions.length === 0) return { error: "No valid rows found. Expected: date,description,amount[,category]." };

  await prisma.bankTransaction.createMany({ data: transactions });
  revalidatePath("/staff/finance");
  return { ok: true, count: transactions.length };
}
