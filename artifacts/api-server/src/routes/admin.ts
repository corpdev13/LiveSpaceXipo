import { Router } from "express";
import { db, investorsTable, holdingsTable, depositsTable, depositAddressesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { sendInvestorStatusEmail } from "../lib/email";

const router = Router();

function checkAdminAuth(req: any, res: any): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const pw = req.headers["x-admin-password"];
  // If no admin password is configured, deny all admin access rather than
  // falling back to a hardcoded/default credential.
  if (!adminPassword || pw !== adminPassword) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

// GET /api/admin/investors — list all investors with holdings
router.get("/admin/investors", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  try {
    const investors = await db.select().from(investorsTable).orderBy(investorsTable.createdAt);
    const holdings = await db.select().from(holdingsTable);

    const holdingMap = new Map(holdings.map((h) => [h.investorId, h]));

    res.json(
      investors.map((inv) => {
        const h = holdingMap.get(inv.id);
        return {
          id: inv.id,
          fullName: inv.fullName,
          email: inv.email,
          status: inv.status,
          createdAt: inv.createdAt.toISOString(),
          shares: h?.shares ?? "0",
          avgCost: h?.avgCost ?? "0",
        };
      })
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list investors");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/admin/investors/:id/status — update investor status
router.patch("/admin/investors/:id/status", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid investor ID." });
    return;
  }

  const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status." });
    return;
  }

  try {
    const [investor] = await db
      .update(investorsTable)
      .set({ status: parsed.data.status })
      .where(eq(investorsTable.id, id))
      .returning();

    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    const [h] = await db.select().from(holdingsTable).where(eq(holdingsTable.investorId, investor.id));

    if (investor.status === "approved" || investor.status === "rejected") {
      // Fire-and-forget: never let a flaky email provider block the admin action.
      void sendInvestorStatusEmail({
        to: investor.email,
        fullName: investor.fullName,
        status: investor.status,
      }).catch((err) => req.log.error({ err }, "Unhandled error sending investor status email"));
    }

    res.json({
      id: investor.id,
      fullName: investor.fullName,
      email: investor.email,
      status: investor.status,
      createdAt: investor.createdAt.toISOString(),
      shares: h?.shares ?? "0",
      avgCost: h?.avgCost ?? "0",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update investor status");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/admin/investors/:id/credit — manually credit shares
router.post("/admin/investors/:id/credit", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid investor ID." });
    return;
  }

  const parsed = z.object({
    shares: z.number().min(0),
    pricePerShare: z.number().min(0),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Provide shares and pricePerShare." });
    return;
  }

  const { shares: newShares, pricePerShare } = parsed.data;

  try {
    const [investor] = await db.select().from(investorsTable).where(eq(investorsTable.id, id)).limit(1);
    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    // Upsert holdings with weighted average cost
    const [existing] = await db.select().from(holdingsTable).where(eq(holdingsTable.investorId, id)).limit(1);

    let totalShares: number;
    let newAvgCost: number;

    if (existing) {
      const existingShares = parseFloat(existing.shares);
      const existingAvg = parseFloat(existing.avgCost);
      totalShares = existingShares + newShares;
      newAvgCost = totalShares > 0
        ? (existingShares * existingAvg + newShares * pricePerShare) / totalShares
        : 0;
    } else {
      totalShares = newShares;
      newAvgCost = pricePerShare;
    }

    const [holding] = await db
      .insert(holdingsTable)
      .values({
        investorId: id,
        shares: String(totalShares),
        avgCost: String(newAvgCost),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: holdingsTable.investorId,
        set: {
          shares: String(totalShares),
          avgCost: String(newAvgCost),
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({
      investorId: holding.investorId,
      shares: holding.shares,
      avgCost: holding.avgCost,
      updatedAt: holding.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to credit investor");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/admin/deposits/:id/status — update deposit status
router.patch("/admin/deposits/:id/status", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid deposit ID." });
    return;
  }

  const parsed = z.object({ status: z.enum(["pending", "completed", "failed"]) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Status must be pending, completed, or failed." });
    return;
  }

  try {
    const [deposit] = await db
      .update(depositsTable)
      .set({ status: parsed.data.status })
      .where(eq(depositsTable.id, id))
      .returning();

    if (!deposit) {
      res.status(404).json({ error: "Deposit not found." });
      return;
    }

    res.json({
      id: deposit.id,
      investorId: deposit.investorId,
      email: deposit.email,
      amount: deposit.amount,
      method: deposit.method,
      coin: deposit.coin,
      status: deposit.status,
      createdAt: deposit.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update deposit status");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/admin/deposits — list all deposits with investor info
router.get("/admin/deposits", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  try {
    const deposits = await db
      .select({
        id: depositsTable.id,
        investorId: depositsTable.investorId,
        fullName: investorsTable.fullName,
        email: depositsTable.email,
        amount: depositsTable.amount,
        method: depositsTable.method,
        coin: depositsTable.coin,
        status: depositsTable.status,
        createdAt: depositsTable.createdAt,
      })
      .from(depositsTable)
      .leftJoin(investorsTable, eq(depositsTable.investorId, investorsTable.id))
      .orderBy(desc(depositsTable.createdAt));

    res.json(
      deposits.map((d) => ({
        id: d.id,
        investorId: d.investorId,
        fullName: d.fullName ?? "—",
        email: d.email,
        amount: d.amount,
        method: d.method,
        coin: d.coin,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list deposits");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/admin/deposit-addresses
router.get("/admin/deposit-addresses", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  try {
    const addresses = await db.select().from(depositAddressesTable);
    res.json(addresses.map((a) => ({
      coin: a.coin,
      address: a.address,
      updatedAt: a.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get deposit addresses");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PUT /api/admin/deposit-addresses/:coin
router.put("/admin/deposit-addresses/:coin", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const coin = req.params.coin.toUpperCase();
  if (!["BTC", "ETH", "DOGE"].includes(coin)) {
    res.status(400).json({ error: "Invalid coin. Supported: BTC, ETH, DOGE." });
    return;
  }

  const parsed = z.object({ address: z.string().min(10) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid address." });
    return;
  }

  try {
    const [addr] = await db
      .insert(depositAddressesTable)
      .values({ coin, address: parsed.data.address, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: depositAddressesTable.coin,
        set: { address: parsed.data.address, updatedAt: new Date() },
      })
      .returning();

    res.json({
      coin: addr.coin,
      address: addr.address,
      updatedAt: addr.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update deposit address");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
