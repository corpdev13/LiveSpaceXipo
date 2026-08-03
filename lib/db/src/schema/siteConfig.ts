import { pgTable, integer, boolean, timestamp } from "drizzle-orm/pg-core";

// Single-row table (id is always 1) holding platform-wide feature toggles.
export const siteConfigTable = pgTable("site_config", {
  id: integer("id").primaryKey().default(1),
  sellingEnabled: boolean("selling_enabled").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SiteConfig = typeof siteConfigTable.$inferSelect;
