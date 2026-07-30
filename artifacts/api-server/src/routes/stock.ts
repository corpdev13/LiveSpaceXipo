import { Router } from "express";

const router = Router();

const BASE_PRICE = 147.62;
const CHANGE = -1.86;
const CHANGE_PCT = -1.24;

// GET /api/stock/quote — current SPCX quote
router.get("/stock/quote", (_req, res) => {
  // Simulate slight live variation
  const noise = (Math.random() - 0.5) * 0.2;
  const price = Math.round((BASE_PRICE + noise) * 100) / 100;

  res.json({
    symbol: "SPCX",
    price,
    change: CHANGE,
    changePct: CHANGE_PCT,
    volume: "25.69M",
    marketCap: "$1.92T",
    bid: 147.63,
    ask: 147.72,
    dayLow: 147.36,
    dayHigh: 158.93,
    week52High: 178.45,
    week52Low: 135.0,
    peRatio: null,
    avgVolume: "25.69M",
    sharesOut: "13.00B",
  });
});

// GET /api/stock/history — price history for chart
router.get("/stock/history", (req, res) => {
  const period = (req.query.period as string) || "1D";

  const now = Date.now();
  let points: number;
  let stepMs: number;

  switch (period) {
    case "1D": points = 120; stepMs = 5 * 60 * 1000; break;
    case "1W": points = 168; stepMs = 60 * 60 * 1000; break;
    case "1M": points = 120; stepMs = 6 * 60 * 60 * 1000; break;
    case "3M": points = 90; stepMs = 24 * 60 * 60 * 1000; break;
    case "1Y": points = 252; stepMs = 24 * 60 * 60 * 1000; break;
    case "5Y": points = 260; stepMs = 7 * 24 * 60 * 60 * 1000; break;
    default: points = 120; stepMs = 5 * 60 * 1000;
  }

  // Generate a random walk that ends near BASE_PRICE
  const startPrice = BASE_PRICE - CHANGE;
  const data: { time: string; price: number }[] = [];

  let price = startPrice * 0.9 + (Math.random() * startPrice * 0.2);
  for (let i = 0; i < points; i++) {
    const ts = now - (points - i) * stepMs;
    // Drift toward BASE_PRICE at the end
    const progressToEnd = i / points;
    const targetPrice = startPrice + (BASE_PRICE - startPrice) * progressToEnd;
    const volatility = BASE_PRICE * 0.004;
    price = price + (targetPrice - price) * 0.1 + (Math.random() - 0.5) * volatility;
    price = Math.max(price, BASE_PRICE * 0.8);

    const t = new Date(ts);
    let timeStr: string;
    if (period === "1D") {
      timeStr = t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } else if (period === "1W" || period === "1M") {
      timeStr = t.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      timeStr = t.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }

    data.push({ time: timeStr, price: Math.round(price * 100) / 100 });
  }

  res.json({ period, data });
});

export default router;
