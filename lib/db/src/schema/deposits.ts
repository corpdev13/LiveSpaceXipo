import { pgTable, serial, integer, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { investorsTable } from "./investors";

export const depositMethodEnum = pgEnum("deposit_method", ["card", "crypto"]);
export const depositStatusEnum = pgEnum("deposit_status", ["pending", "completed", "failed"]);

export const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").references(() => investorsTable.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  method: depositMethodEnum("method").notNull(),
  coin: text("coin"),          // BTC | ETH | DOGE — only when method=crypto
  status: depositStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Deposit = typeof depositsTable.$inferSelect;
