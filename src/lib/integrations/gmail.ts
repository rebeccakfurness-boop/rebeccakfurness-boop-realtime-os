/**
 * Gmail integration boundary.
 *
 * Real usage: a staff member connects their Google account from
 * /staff/settings (see src/app/api/google/connect, src/lib/integrations/
 * google-auth.ts). Once GOOGLE_CLIENT_ID/SECRET are set AND a staff Google
 * account is connected, the CRM's "Sync Gmail" action reads real threaded
 * correspondence via the Gmail API instead of the mock.
 */

import { google, type gmail_v1 } from "googleapis";
import { getAuthorizedGoogleClient, getConnectedGoogleAccount, isGoogleConfigured } from "@/lib/integrations/google-auth";

export interface GmailMessage {
  contactEmail: string;
  subject: string;
  body: string;
  direction: "inbound" | "outbound";
  timestamp: Date;
}

export interface GmailClient {
  listMessagesForAddresses(addresses: string[]): Promise<GmailMessage[]>;
}

class MockGmailClient implements GmailClient {
  async listMessagesForAddresses(addresses: string[]): Promise<GmailMessage[]> {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    return addresses.flatMap((address, i) => [
      {
        contactEmail: address,
        subject: "Re: Booking a session for Term 3",
        body: "Thanks for getting back to me so quickly. Term 3 from 20 July works well on our end, could you send through the proposal?",
        direction: "inbound" as const,
        timestamp: new Date(now - day * (3 + i)),
      },
      {
        contactEmail: address,
        subject: "Booking a session for Term 3",
        body: "Following up on our call, here's the tailored proposal for your students. Let me know if the date works and I'll lock it in.",
        direction: "outbound" as const,
        timestamp: new Date(now - day * (4 + i)),
      },
    ]);
  }
}

function headerValue(message: gmail_v1.Schema$Message, name: string) {
  return message.payload?.headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

class RealGmailClient implements GmailClient {
  async listMessagesForAddresses(addresses: string[]): Promise<GmailMessage[]> {
    const auth = await getAuthorizedGoogleClient();
    const account = await getConnectedGoogleAccount();
    if (!auth || !account?.user.email) return [];

    const gmail = google.gmail({ version: "v1", auth });
    const ownEmail = account.user.email.toLowerCase();
    const results: GmailMessage[] = [];

    for (const address of addresses) {
      const list = await gmail.users.messages.list({ userId: "me", q: `{from:${address} to:${address}}`, maxResults: 15 });
      for (const item of list.data.messages ?? []) {
        if (!item.id) continue;
        const full = await gmail.users.messages.get({
          userId: "me",
          id: item.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "To", "Date"],
        });
        const from = headerValue(full.data, "From").toLowerCase();
        results.push({
          contactEmail: address,
          subject: headerValue(full.data, "Subject") || "(no subject)",
          body: full.data.snippet ?? "",
          direction: from.includes(ownEmail) ? "outbound" : "inbound",
          timestamp: full.data.internalDate ? new Date(Number(full.data.internalDate)) : new Date(),
        });
      }
    }
    return results;
  }
}

export async function createGmailClient(): Promise<GmailClient> {
  if (!isGoogleConfigured()) return new MockGmailClient();
  return new RealGmailClient();
}
