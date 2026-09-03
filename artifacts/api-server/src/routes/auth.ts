import { Router } from "express";
import { db, investorsTable, passwordSetupTokensTable } from "@workspace/db";
import { LookupSignInBody, SetupPasswordBody, SignInBody } from "@workspace/api-zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { createPasswordSetupToken, hashPassword, hashSetupToken, verifyPassword } from "../lib/password";

const router = Router();

// POST /api/signin/lookup — decide whether the account needs setup or a password
router.post("/signin/lookup", async (req, res): Promise<void> => {
  const parsed = LookupSignInBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const [investor] = await db
      .select({
        id: investorsTable.id,
        email: investorsTable.email,
        passwordHash: investorsTable.passwordHash,
      })
      .from(investorsTable)
      .where(eq(investorsTable.email, email))
      .limit(1);

    if (!investor) {
      res.status(404).json({ error: "No account found with this email." });
      return;
    }

    if (investor.passwordHash) {
      res.json({ next: "password", email: investor.email, setupToken: null });
      return;
    }

    const setupToken = createPasswordSetupToken();
    await db.insert(passwordSetupTokensTable).values({
      investorId: investor.id,
      tokenHash: hashSetupToken(setupToken),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.json({ next: "setup", email: investor.email, setupToken });
  } catch (err) {
    req.log.error({ err }, "Failed to look up sign in");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/password/setup — create the first password for a legacy investor
router.post("/password/setup", async (req, res): Promise<void> => {
  const parsed = SetupPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const { token, password } = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      const [setupToken] = await tx
        .select()
        .from(passwordSetupTokensTable)
        .where(
          and(
            eq(passwordSetupTokensTable.tokenHash, hashSetupToken(token)),
            isNull(passwordSetupTokensTable.usedAt),
            gt(passwordSetupTokensTable.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!setupToken) throw new Error("PASSWORD_SETUP_TOKEN_INVALID");

      const [claimedToken] = await tx
        .update(passwordSetupTokensTable)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordSetupTokensTable.id, setupToken.id),
            isNull(passwordSetupTokensTable.usedAt),
          ),
        )
        .returning({ investorId: passwordSetupTokensTable.investorId });

      if (!claimedToken) throw new Error("PASSWORD_SETUP_TOKEN_INVALID");

      const [investor] = await tx
        .update(investorsTable)
        .set({ passwordHash: hashPassword(password) })
        .where(eq(investorsTable.id, claimedToken.investorId))
        .returning({ email: investorsTable.email });

      if (!investor) throw new Error("INVESTOR_NOT_FOUND");
      return investor;
    });

    res.json({ success: true, email: result.email });
  } catch (err) {
    if (err instanceof Error && err.message === "PASSWORD_SETUP_TOKEN_INVALID") {
      res.status(400).json({ error: "This password setup link is invalid or has expired." });
      return;
    }
    req.log.error({ err }, "Failed to set up investor password");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

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
