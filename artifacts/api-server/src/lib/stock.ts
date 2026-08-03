export const STOCK_BASE_PRICE = 147.62;

/**
 * Returns the current simulated SPCX quote price. Shared by the public
 * stock-quote endpoint and the trading endpoints so buy/sell execute at the
 * same price the investor sees on screen.
 */
export function getCurrentStockPrice(): number {
  const noise = (Math.random() - 0.5) * 0.2;
  return Math.round((STOCK_BASE_PRICE + noise) * 100) / 100;
}
