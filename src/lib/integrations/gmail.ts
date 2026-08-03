/**
 * Gmail integration boundary.
 *
 * Real usage: set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET, implement the OAuth
 * consent flow for a staff Gmail account, and swap MockGmailClient below for a
 * real client that calls the Gmail API (users.messages.list / .get) filtered to
 * the contact email addresses on an Organisation, then upsert results into the
 * Email table via the same shape this mock returns.
 *
 * Until then, every call to the CRM's "Sync Gmail" action runs against this
 * mock, so the threaded-email timeline on a Customer Card is fully usable in
 * dev without real credentials.
 */

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

export function createGmailClient(): GmailClient {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // TODO: return a real Gmail API-backed client once OAuth credentials are live.
    console.warn("[gmail] GOOGLE_CLIENT_ID is set but no live Gmail client is implemented yet, falling back to mock.");
  }
  return new MockGmailClient();
}
