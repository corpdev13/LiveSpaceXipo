import { db, siteConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * The persisted internal SPCX market data is shared by the public quote,
 * history, and trading endpoints so every calculation uses the same value.
 */
export const STOCK_BASE_PRICE = 147.62;
export const STOCK_BASE_MARKET_CAP = "$1.92T";

export async function getMarketConfig() {
  const [config] = await db
    .select()
    .from(siteConfigTable)
    .where(eq(siteConfigTable.id, 1))
    .limit(1);

  return {
    marketPrice: Number(config?.marketPrice ?? STOCK_BASE_PRICE),
    previousMarketPrice: Number(config?.previousMarketPrice ?? STOCK_BASE_PRICE),
    marketCap: config?.marketCap ?? STOCK_BASE_MARKET_CAP,
  };
}

export async function getCurrentStockPrice(): Promise<number> {
  const { marketPrice } = await getMarketConfig();
  return marketPrice;
}
