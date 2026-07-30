import { Router } from "express";
import { db, investorsTable, holdingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/holdings?email= — get holdings for current user
router.get("/holdings", async (req, res) => {
  const email = (req.query.email as string | undefined)?.toLowerCase().trim();
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  try {
    const [investor] = await db
      .select()
      .from(investorsTable)
      .where(eq(investorsTable.email, email))
      .limit(1);

    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    const [holding] = await db
      .select()
      .from(holdingsTable)
      .where(eq(holdingsTable.investorId, investor.id))
      .limit(1);

    // Return zeroed holding if none exists yet
    const result = holding ?? {
      investorId: investor.id,
      shares: "0",
      avgCost: "0",
      updatedAt: new Date(),
    };

    res.json({
      investorId: result.investorId,
      shares: result.shares,
      avgCost: result.avgCost,
      updatedAt: result.updatedAt instanceof Date ? result.updatedAt.toISOString() : result.updatedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get holdings");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
