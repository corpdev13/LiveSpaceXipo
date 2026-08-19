import { pgTable, serial, integer, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { investorsTable } from "./investors";

export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "completed", "failed"]);

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").references(() => investorsTable.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  coin: text("coin").notNull(),
  address: text("address").notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Withdrawal = typeof withdrawalsTable.$inferSelect;