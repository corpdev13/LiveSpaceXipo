import { pgTable, integer, boolean, numeric, text, timestamp } from "drizzle-orm/pg-core";

// Single-row table (id is always 1) holding platform-wide feature toggles.
export const siteConfigTable = pgTable("site_config", {
  id: integer("id").primaryKey().default(1),
  sellingEnabled: boolean("selling_enabled").default(false).notNull(),
  marketPrice: numeric("market_price", { precision: 18, scale: 4 }).default("147.62").notNull(),
  previousMarketPrice: numeric("previous_market_price", { precision: 18, scale: 4 }).default("147.62").notNull(),
  marketCap: text("market_cap").default("$1.92T").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SiteConfig = typeof siteConfigTable.$inferSelect;
