import { Router } from "express";
import { db, investorsTable, depositsTable, depositAddressesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const CreateDepositSchema = z.object({
  email: z.string().email(),
  amount: z.number().min(1),
  method: z.enum(["card", "crypto"]),
  coin: z.enum(["BTC", "ETH", "DOGE"]).optional(),
});

// POST /api/deposits — submit a deposit
router.post("/deposits", async (req, res) => {
  const parsed = CreateDepositSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input." });
    return;
  }
  const { email, amount, method, coin } = parsed.data;

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

    const [deposit] = await db
      .insert(depositsTable)
      .values({
        investorId: investor.id,
        email: investor.email,
        amount: String(amount),
        method,
        coin: coin ?? null,
        status: "pending",
      })
      .returning();

    res.status(201).json({
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
    req.log.error({ err }, "Failed to create deposit");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/deposit-addresses — public list of crypto deposit addresses
router.get("/deposit-addresses", async (req, res) => {
  try {
    const addresses = await db.select().from(depositAddressesTable);
    res.json(
      addresses.map((a) => ({
        coin: a.coin,
        address: a.address,
        updatedAt: a.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get deposit addresses");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
