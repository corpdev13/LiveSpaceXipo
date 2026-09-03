import { Router } from "express";
import { db, investorsTable } from "@workspace/db";
import { SignInBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../lib/password";

const router = Router();

// POST /api/signin — check email, return investor status
router.post("/signin", async (req, res) => {
  const parsed = SignInBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [investor] = await db
      .select({
        status: investorsTable.status,
        fullName: investorsTable.fullName,
        email: investorsTable.email,
        passwordHash: investorsTable.passwordHash,
      })
      .from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!investor) {
      res.status(404).json({ error: "No account found with this email." });
      return;
    }

    if (!investor.passwordHash || !verifyPassword(password, investor.passwordHash)) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    res.json({
      status: investor.status,
      fullName: investor.fullName,
      email: investor.email,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to sign in");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
