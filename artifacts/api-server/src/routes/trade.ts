import { Router } from "express";
import { db, investorsTable, holdingsTable, siteConfigTable } from "@workspace/db";
import { BuySharesBody, SellSharesBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { getCurrentStockPrice } from "../lib/stock";

const router = Router();

async function getSellingEnabled(): Promise<boolean> {
  const [config] = await db.select().from(siteConfigTable).where(eq(siteConfigTable.id, 1)).limit(1);
  return config?.sellingEnabled ?? false;
}

// GET /api/site-config — public platform configuration
router.get("/site-config", async (req, res) => {
  try {
    const sellingEnabled = await getSellingEnabled();
    res.json({ sellingEnabled });
  } catch (err) {
    req.log.error({ err }, "Failed to get site config");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/trade/buy — spend cash balance to buy shares at the current quote
router.post("/trade/buy", async (req, res) => {
  const parsed = BuySharesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Provide email and amountUsd." });
    return;
  }
  const { email, amountUsd } = parsed.data;

  try {
    const [investor] = await db
      .select()
      .from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }
    if (investor.status !== "approved") {
      res.status(403).json({ error: "Only approved investors can trade." });
      return;
    }

    const [existing] = await db.select().from(holdingsTable).where(eq(holdingsTable.investorId, investor.id)).limit(1);
    const cashBalance = parseFloat(existing?.cashBalance ?? "0");

    if (amountUsd > cashBalance) {
      res.status(400).json({ error: "Insufficient cash balance." });
      return;
    }

    const price = getCurrentStockPrice();
    const sharesBought = amountUsd / price;
    const existingShares = parseFloat(existing?.shares ?? "0");
    const existingAvg = parseFloat(existing?.avgCost ?? "0");
    const totalShares = existingShares + sharesBought;
    const newAvgCost = totalShares > 0 ? (existingShares * existingAvg + sharesBought * price) / totalShares : 0;
    const newCashBalance = cashBalance - amountUsd;

    const [holding] = await db
      .insert(holdingsTable)
      .values({
        investorId: investor.id,
        shares: String(totalShares),
        avgCost: String(newAvgCost),
        cashBalance: String(newCashBalance),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: holdingsTable.investorId,
        set: {
          shares: String(totalShares),
          avgCost: String(newAvgCost),
          cashBalance: String(newCashBalance),
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({
      investorId: holding.investorId,
      shares: holding.shares,
      avgCost: holding.avgCost,
      cashBalance: holding.cashBalance,
      updatedAt: holding.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to buy shares");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/trade/sell — sell shares back for cash at the current quote (admin-gated)
router.post("/trade/sell", async (req, res) => {
  const parsed = SellSharesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Provide email and shares." });
    return;
  }
  const { email, shares: sellShares } = parsed.data;

  try {
    const sellingEnabled = await getSellingEnabled();
    if (!sellingEnabled) {
      res.status(403).json({ error: "Selling is currently disabled by the platform admin." });
      return;
    }

    const [investor] = await db
      .select()
      .from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }
    if (investor.status !== "approved") {
      res.status(403).json({ error: "Only approved investors can trade." });
      return;
    }

    const [existing] = await db.select().from(holdingsTable).where(eq(holdingsTable.investorId, investor.id)).limit(1);
    const ownedShares = parseFloat(existing?.shares ?? "0");

    if (sellShares > ownedShares) {
      res.status(400).json({ error: "You cannot sell more shares than you own." });
      return;
    }

    const price = getCurrentStockPrice();
    const proceeds = sellShares * price;
    const remainingShares = ownedShares - sellShares;
    const newAvgCost = remainingShares > 0 ? parseFloat(existing?.avgCost ?? "0") : 0;
    const newCashBalance = parseFloat(existing?.cashBalance ?? "0") + proceeds;

    const [holding] = await db
      .insert(holdingsTable)
      .values({
        investorId: investor.id,
        shares: String(remainingShares),
        avgCost: String(newAvgCost),
        cashBalance: String(newCashBalance),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: holdingsTable.investorId,
        set: {
          shares: String(remainingShares),
          avgCost: String(newAvgCost),
          cashBalance: String(newCashBalance),
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({
      investorId: holding.investorId,
      shares: holding.shares,
      avgCost: holding.avgCost,
      cashBalance: holding.cashBalance,
      updatedAt: holding.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to sell shares");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
