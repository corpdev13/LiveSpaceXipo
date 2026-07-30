import { Router } from "express";
import { db, investorsTable } from "@workspace/db";
import { CreateInvestorBody } from "@workspace/api-zod";
import { count } from "drizzle-orm";

const router = Router();

// POST /api/investors — sign up for investor access
router.post("/investors", async (req, res) => {
  const parsed = CreateInvestorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Full name and email are required." });
    return;
  }

  const { fullName, email } = parsed.data;

  try {
    const [investor] = await db
      .insert(investorsTable)
      .values({ fullName: fullName.trim(), email: email.toLowerCase().trim() })
      .returning();

    res.status(201).json({
      id: investor.id,
      fullName: investor.fullName,
      email: investor.email,
      status: investor.status,
      createdAt: investor.createdAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "This email is already registered." });
      return;
    }
    req.log.error({ err }, "Failed to create investor");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// GET /api/investors/count — get total registered investor count
router.get("/investors/count", async (req, res) => {
  try {
    const [result] = await db.select({ count: count() }).from(investorsTable);
    res.json({ count: Number(result.count) });
  } catch (err) {
    req.log.error({ err }, "Failed to get investor count");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
