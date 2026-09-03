import { Router } from "express";
import { db, investorsTable, holdingsTable, depositsTable, depositAddressesTable, siteConfigTable, notificationsTable, withdrawalsTable } from "@workspace/db";
import { SendAdminNotificationBody } from "@workspace/api-zod";
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
          withdrawalEnabled: inv.withdrawalEnabled,
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
      withdrawalEnabled: investor.withdrawalEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update investor status");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/admin/investors/:id/withdrawal-access — control access for one investor
router.patch("/admin/investors/:id/withdrawal-access", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid investor ID." });
    return;
  }

  const parsed = z.object({ withdrawalEnabled: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide withdrawalEnabled as a boolean." });
    return;
  }

  try {
    const [investor] = await db
      .update(investorsTable)
      .set({ withdrawalEnabled: parsed.data.withdrawalEnabled })
      .where(eq(investorsTable.id, id))
      .returning();

    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    const [holding] = await db.select().from(holdingsTable).where(eq(holdingsTable.investorId, id)).limit(1);
    res.json({
      id: investor.id,
      fullName: investor.fullName,
      email: investor.email,
      status: investor.status,
      createdAt: investor.createdAt.toISOString(),
      shares: holding?.shares ?? "0",
      avgCost: holding?.avgCost ?? "0",
      withdrawalEnabled: investor.withdrawalEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update investor withdrawal access");
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
    const [existingDeposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, id)).limit(1);
    if (!existingDeposit) {
      res.status(404).json({ error: "Deposit not found." });
      return;
    }
    const wasCompleted = existingDeposit.status === "completed";

    const [deposit] = await db
      .update(depositsTable)
      .set({ status: parsed.data.status })
      .where(eq(depositsTable.id, id))
      .returning();

    if (!deposit) {
      res.status(404).json({ error: "Deposit not found." });
      return;
    }

    // Credit the investor's spendable cash balance the moment a deposit is
    // marked completed, so they can immediately buy shares with it.
    if (!wasCompleted && deposit.status === "completed") {
      const [existingHolding] = await db
        .select()
        .from(holdingsTable)
        .where(eq(holdingsTable.investorId, deposit.investorId))
        .limit(1);
      const newCashBalance = parseFloat(existingHolding?.cashBalance ?? "0") + parseFloat(deposit.amount);

      await db
        .insert(holdingsTable)
        .values({ investorId: deposit.investorId, cashBalance: String(newCashBalance), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: holdingsTable.investorId,
          set: { cashBalance: String(newCashBalance), updatedAt: new Date() },
        });
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

// PATCH /api/admin/site-config — update platform-wide toggles (e.g. selling)
router.patch("/admin/site-config", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const parsed = z.object({
    sellingEnabled: z.boolean().optional(),
    marketPrice: z.number().positive().max(1000000).optional(),
    marketCap: z.string().trim().min(1).max(40).optional(),
  }).refine((value) => Object.keys(value).length > 0, {
    message: "At least one setting is required.",
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a valid selling toggle, share price, or market cap." });
    return;
  }

  try {
    const config = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(siteConfigTable)
        .where(eq(siteConfigTable.id, 1))
        .limit(1);

      const currentPrice = Number(existing?.marketPrice ?? "147.62");
      const nextPrice = parsed.data.marketPrice ?? currentPrice;
      const priceIncreased = nextPrice > currentPrice;
      const change = nextPrice - currentPrice;
      const changePct = currentPrice > 0 ? (change / currentPrice) * 100 : 0;

      const [updated] = await tx
        .insert(siteConfigTable)
        .values({
          id: 1,
          sellingEnabled: parsed.data.sellingEnabled ?? existing?.sellingEnabled ?? false,
          marketPrice: String(nextPrice),
          previousMarketPrice: parsed.data.marketPrice !== undefined
            ? String(currentPrice)
            : existing?.previousMarketPrice ?? String(currentPrice),
          marketCap: parsed.data.marketCap ?? existing?.marketCap ?? "$1.92T",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteConfigTable.id,
          set: {
            ...(parsed.data.sellingEnabled !== undefined ? { sellingEnabled: parsed.data.sellingEnabled } : {}),
            ...(parsed.data.marketPrice !== undefined ? {
              marketPrice: String(nextPrice),
              previousMarketPrice: String(currentPrice),
            } : {}),
            ...(parsed.data.marketCap !== undefined ? { marketCap: parsed.data.marketCap } : {}),
            updatedAt: new Date(),
          },
        })
        .returning();

      if (priceIncreased) {
        const investors = await tx.select({ id: investorsTable.id }).from(investorsTable);
        if (investors.length > 0) {
          const message = `SPCX price update: the internal share price rose from $${currentPrice.toFixed(2)} to $${nextPrice.toFixed(2)} (+$${change.toFixed(2)}, +${changePct.toFixed(2)}%). Your portfolio values now reflect the new price.`;
          await tx.insert(notificationsTable).values(
            investors.map((investor) => ({ investorId: investor.id, message })),
          );
        }
      }

      return updated;
    });

    res.json({
      sellingEnabled: config.sellingEnabled,
      marketPrice: Number(config.marketPrice),
      marketCap: config.marketCap,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update site config");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/admin/notifications — send a broker message to one investor
router.post("/admin/notifications", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const parsed = SendAdminNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a valid investor email and message." });
    return;
  }

  try {
    const email = parsed.data.email.toLowerCase().trim();
    const [investor] = await db.select().from(investorsTable).where(eq(investorsTable.email, email)).limit(1);
    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    const [notification] = await db
      .insert(notificationsTable)
      .values({ investorId: investor.id, message: parsed.data.message.trim() })
      .returning();

    res.status(201).json({
      id: notification.id,
      investorId: notification.investorId,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send admin notification");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/admin/withdrawals — list withdrawal requests for operations review
router.get("/admin/withdrawals", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  try {
    const withdrawals = await db
      .select({
        id: withdrawalsTable.id,
        investorId: withdrawalsTable.investorId,
        email: withdrawalsTable.email,
        fullName: investorsTable.fullName,
        amount: withdrawalsTable.amount,
        coin: withdrawalsTable.coin,
        address: withdrawalsTable.address,
        status: withdrawalsTable.status,
        createdAt: withdrawalsTable.createdAt,
      })
      .from(withdrawalsTable)
      .leftJoin(investorsTable, eq(withdrawalsTable.investorId, investorsTable.id))
      .orderBy(desc(withdrawalsTable.createdAt));

    res.json(withdrawals.map((withdrawal) => ({
      ...withdrawal,
      fullName: withdrawal.fullName ?? "—",
      createdAt: withdrawal.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list withdrawals");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/admin/withdrawals/:id/status — complete or fail a pending request
router.patch("/admin/withdrawals/:id/status", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid withdrawal ID." });
    return;
  }

  const parsed = z.object({ status: z.enum(["completed", "failed"]) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Status must be completed or failed." });
    return;
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
      if (!existing) throw new Error("WITHDRAWAL_NOT_FOUND");
      if (existing.status !== "pending") throw new Error("WITHDRAWAL_ALREADY_RESOLVED");

      const [withdrawal] = await tx
        .update(withdrawalsTable)
        .set({ status: parsed.data.status })
        .where(eq(withdrawalsTable.id, id))
        .returning();

      if (parsed.data.status === "failed") {
        const [holding] = await tx.select().from(holdingsTable).where(eq(holdingsTable.investorId, existing.investorId)).limit(1);
        const restoredCash = parseFloat(holding?.cashBalance ?? "0") + parseFloat(existing.amount);
        await tx
          .insert(holdingsTable)
          .values({ investorId: existing.investorId, cashBalance: String(restoredCash), updatedAt: new Date() })
          .onConflictDoUpdate({
            target: holdingsTable.investorId,
            set: { cashBalance: String(restoredCash), updatedAt: new Date() },
          });
      }

      return withdrawal;
    });

    const [investor] = await db.select({ fullName: investorsTable.fullName }).from(investorsTable).where(eq(investorsTable.id, result.investorId)).limit(1);
    res.json({
      id: result.id,
      investorId: result.investorId,
      email: result.email,
      fullName: investor?.fullName ?? "—",
      amount: result.amount,
      coin: result.coin,
      address: result.address,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (reason === "WITHDRAWAL_NOT_FOUND") {
      res.status(404).json({ error: "Withdrawal not found." });
      return;
    }
    if (reason === "WITHDRAWAL_ALREADY_RESOLVED") {
      res.status(400).json({ error: "This withdrawal has already been resolved." });
      return;
    }
    req.log.error({ err }, "Failed to update withdrawal status");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
