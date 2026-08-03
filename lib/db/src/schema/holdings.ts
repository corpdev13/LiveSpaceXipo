import { pgTable, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { investorsTable } from "./investors";

export const holdingsTable = pgTable("holdings", {
  investorId: integer("investor_id").primaryKey().references(() => investorsTable.id, { onDelete: "cascade" }),
  shares: numeric("shares", { precision: 18, scale: 4 }).default("0").notNull(),
  avgCost: numeric("avg_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  // Spendable USD balance, credited from completed deposits and debited/credited by trades.
  cashBalance: numeric("cash_balance", { precision: 18, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Holding = typeof holdingsTable.$inferSelect;
