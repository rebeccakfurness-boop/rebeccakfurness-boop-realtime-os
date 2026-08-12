"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { disconnectGoogleAccount } from "@/lib/integrations/google-auth";

export async function disconnectGoogle() {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") throw new Error("Staff only");
  await disconnectGoogleAccount();
  revalidatePath("/staff/settings");
}
