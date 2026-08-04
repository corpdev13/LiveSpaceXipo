import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { investorsTable } from "./investors";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").references(() => investorsTable.id, { onDelete: "cascade" }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notificationsTable.$inferSelect;
