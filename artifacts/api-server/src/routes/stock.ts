import { Router } from "express";
import { getMarketConfig } from "../lib/stock";

const router = Router();

// GET /api/stock/quote — current SPCX quote
router.get("/stock/quote", async (req, res) => {
  try {
    const { marketPrice, previousMarketPrice, marketCap } = await getMarketConfig();
    const change = Math.round((marketPrice - previousMarketPrice) * 100) / 100;
    const changePct = previousMarketPrice > 0
      ? Math.round((change / previousMarketPrice) * 10000) / 100
      : 0;

    res.json({
      symbol: "SPCX",
      price: marketPrice,
      change,
      changePct,
      volume: "25.69M",
      marketCap,
      bid: Math.max(0, Math.round((marketPrice - 0.09) * 100) / 100),
      ask: Math.round((marketPrice + 0.09) * 100) / 100,
      dayLow: Math.max(0, Math.round((marketPrice * 0.995) * 100) / 100),
      dayHigh: Math.round((marketPrice * 1.075) * 100) / 100,
      week52High: Math.round((marketPrice * 1.21) * 100) / 100,
      week52Low: Math.max(0, Math.round((marketPrice * 0.91) * 100) / 100),
      peRatio: null,
      avgVolume: "25.69M",
      sharesOut: "13.00B",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stock quote");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/stock/history — price history for chart
router.get("/stock/history", async (req, res) => {
  const period = (req.query.period as string) || "1D";

  try {
    const { marketPrice, previousMarketPrice } = await getMarketConfig();
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

    const startPrice = previousMarketPrice;
    const data: { time: string; price: number }[] = [];

    let price = startPrice;
    for (let i = 0; i < points; i++) {
      const ts = now - (points - i) * stepMs;
      const progressToEnd = i / Math.max(points - 1, 1);
      const targetPrice = startPrice + (marketPrice - startPrice) * progressToEnd;
      price = price + (targetPrice - price) * 0.1;

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
  } catch (err) {
    req.log.error({ err }, "Failed to get stock history");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
