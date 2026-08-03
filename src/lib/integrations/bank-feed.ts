/**
 * Xero / bank-feed integration boundary.
 *
 * Real usage: set XERO_CLIENT_ID / XERO_CLIENT_SECRET, implement the Xero OAuth
 * flow, and swap MockBankFeedClient below for a real client that pulls bank
 * transactions via the Xero API (or a direct bank-feed provider) into the same
 * shape the manual CSV import produces (src/lib/actions/finance.ts
 * importBankCsv). Every BankTransaction row looks identical either way, so the
 * cashflow dashboard and forecast never need to know which source populated it.
 */

export interface BankFeedTransaction {
  date: Date;
  description: string;
  amountNzd: number;
  direction: "in" | "out";
  category?: string;
}

export interface BankFeedClient {
  fetchTransactions(sinceDays: number): Promise<BankFeedTransaction[]>;
}

class MockBankFeedClient implements BankFeedClient {
  async fetchTransactions(): Promise<BankFeedTransaction[]> {
    // No live feed configured. Finance relies on manual CSV import until real
    // Xero credentials are provided.
    return [];
  }
}

export function createBankFeedClient(): BankFeedClient {
  if (process.env.XERO_CLIENT_ID && process.env.XERO_CLIENT_SECRET) {
    // TODO: return a real Xero-backed client once OAuth credentials are live.
    console.warn("[bank-feed] XERO_CLIENT_ID is set but no live Xero client is implemented yet, falling back to mock.");
  }
  return new MockBankFeedClient();
}
