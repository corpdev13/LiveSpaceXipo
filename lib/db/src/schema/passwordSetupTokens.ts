import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { investorsTable } from "./investors";

export const passwordSetupTokensTable = pgTable("password_setup_tokens", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id")
    .references(() => investorsTable.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type PasswordSetupToken = typeof passwordSetupTokensTable.$inferSelect;