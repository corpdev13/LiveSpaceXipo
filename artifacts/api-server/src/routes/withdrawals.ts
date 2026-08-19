import { Router } from "express";
import { db, investorsTable, holdingsTable, withdrawalsTable } from "@workspace/db";
import { CreateWithdrawalBody } from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";

const router = Router();

function serializeWithdrawal(withdrawal: typeof withdrawalsTable.$inferSelect) {
  return {
    id: withdrawal.id,
    investorId: withdrawal.investorId,
    email: withdrawal.email,
    amount: withdrawal.amount,
    coin: withdrawal.coin,
    address: withdrawal.address,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt.toISOString(),
  };
}

// GET /api/withdrawals?email= — current user's crypto withdrawal history
router.get("/withdrawals", async (req, res) => {
  const email = (req.query.email as string | undefined)?.toLowerCase().trim();
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  try {
    const [investor] = await db.select().from(investorsTable).where(eq(investorsTable.email, email)).limit(1);
    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    const withdrawals = await db
      .select()
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.investorId, investor.id))
      .orderBy(desc(withdrawalsTable.createdAt));

    res.json(withdrawals.map(serializeWithdrawal));
  } catch (err) {
    req.log.error({ err }, "Failed to list withdrawals");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/withdrawals — request a crypto withdrawal when individually enabled by admin
router.post("/withdrawals", async (req, res) => {
  const parsed = CreateWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a valid email, amount, coin, and wallet address." });
    return;
  }

  const { email: rawEmail, amount, coin, address } = parsed.data;
  const email = rawEmail.toLowerCase().trim();

  try {
    const withdrawal = await db.transaction(async (tx) => {
      const [investor] = await tx.select().from(investorsTable).where(eq(investorsTable.email, email)).limit(1);
      if (!investor) {
        throw new Error("INVESTOR_NOT_FOUND");
      }
      if (investor.status !== "approved") {
        throw new Error("NOT_APPROVED");
      }
      if (!investor.withdrawalEnabled) {
        throw new Error("WITHDRAWAL_DISABLED");
      }

      const [holding] = await tx.select().from(holdingsTable).where(eq(holdingsTable.investorId, investor.id)).limit(1);
      const cashBalance = parseFloat(holding?.cashBalance ?? "0");
      if (!holding || amount > cashBalance) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      await tx
        .update(holdingsTable)
        .set({ cashBalance: String(cashBalance - amount), updatedAt: new Date() })
        .where(eq(holdingsTable.investorId, investor.id));

      const [created] = await tx
        .insert(withdrawalsTable)
        .values({
          investorId: investor.id,
          email: investor.email,
          amount: String(amount),
          coin,
          address: address.trim(),
          status: "pending",
        })
        .returning();

      return created;
    });

    res.status(201).json(serializeWithdrawal(withdrawal));
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (reason === "INVESTOR_NOT_FOUND") {
      res.status(404).json({ error: "Investor not found." });
      return;
    }
    if (reason === "NOT_APPROVED") {
      res.status(403).json({ error: "Only approved investors can withdraw." });
      return;
    }
    if (reason === "WITHDRAWAL_DISABLED") {
      res.status(403).json({ error: "Withdrawal access has not been enabled for your account." });
      return;
    }
    if (reason === "INSUFFICIENT_BALANCE") {
      res.status(400).json({ error: "Insufficient cash balance." });
      return;
    }

    req.log.error({ err }, "Failed to create withdrawal");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;