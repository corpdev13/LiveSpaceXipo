import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One row per supported coin. Seed with BTC, ETH, DOGE.
export const depositAddressesTable = pgTable("deposit_addresses", {
  coin: text("coin").primaryKey(),   // "BTC" | "ETH" | "DOGE"
  address: text("address").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DepositAddress = typeof depositAddressesTable.$inferSelect;
