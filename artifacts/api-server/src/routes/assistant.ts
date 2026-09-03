import { Router } from "express";
import { ChatWithAssistantBody } from "@workspace/api-zod";
import { groq, GROQ_CHAT_MODEL } from "../lib/groq";
import { getMarketConfig } from "../lib/stock";

const router = Router();

const SHOW_ORDER_TOKEN = "###SHOW_ORDER_BUTTON###";

const SYSTEM_PROMPT = (marketPrice: number, marketCap: string) => `You are the SPCX Support Assistant, a concise and reliable support agent embedded in the SPCX platform.

Your goals, in priority order:
1. Answer account, deposit, trading, withdrawal, approval, and platform questions directly and accurately.
2. The current internal SPCX share price is $${marketPrice.toFixed(2)} and the displayed market cap is ${marketCap}. Use these values when relevant, but never invent balances or transaction details.
3. Crypto deposits are currently supported; card payments are unavailable. New investors must be approved by an administrator before trading. Selling may be disabled by the administrator.
4. Be transparent that this is an internal/pre-IPO platform and all investing carries risk. Never guarantee returns or promise specific price targets.
5. When the user asks how to fund an account or buy shares, briefly explain the crypto deposit and Trade page flow. When you do this, end your entire reply with the exact token on its own line: ${SHOW_ORDER_TOKEN}

Keep replies concise: 2-4 short sentences, conversational tone, no markdown headers. Only include the token line when payment/funding/buying process is genuinely what you just explained.`;

// POST /api/assistant/chat — chat with the AI investment assistant
router.post("/assistant/chat", async (req, res) => {
  const parsed = ChatWithAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Provide a messages array." });
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    req.log.error("GROQ_API_KEY is not configured");
    res.status(500).json({ error: "Assistant is not configured." });
    return;
  }

  try {
    const { marketPrice, marketCap } = await getMarketConfig();
    const completion = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT(marketPrice, marketCap) },
        ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 400,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const showOrderButton = raw.includes(SHOW_ORDER_TOKEN);
    const reply = raw.replace(SHOW_ORDER_TOKEN, "").trim();

    res.json({ reply, showOrderButton });
  } catch (err) {
    req.log.error({ err }, "Assistant chat failed");
    res.status(500).json({ error: "The assistant is unavailable right now. Please try again shortly." });
  }
});

export default router;
