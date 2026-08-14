import { Router } from "express";
import { db, investorsTable, notificationsTable } from "@workspace/db";
import { MarkNotificationsReadBody } from "@workspace/api-zod";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

function serialize(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    investorId: n.investorId,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
}

// GET /api/notifications?email= — list broker notifications for the current user
router.get("/notifications", async (req, res) => {
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

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.investorId, investor.id))
      .orderBy(desc(notificationsTable.createdAt));

    res.json(rows.map(serialize));
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/notifications/read — mark all of the current user's notifications as read
router.patch("/notifications/read", async (req, res) => {
  const parsed = MarkNotificationsReadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email is required." });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();

  try {
    const [investor] = await db.select().from(investorsTable).where(eq(investorsTable.email, email)).limit(1);
    if (!investor) {
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.investorId, investor.id), eq(notificationsTable.read, false)));

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.investorId, investor.id))
      .orderBy(desc(notificationsTable.createdAt));

    res.json(rows.map(serialize));
  } catch (err) {
    req.log.error({ err }, "Failed to mark notifications read");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
