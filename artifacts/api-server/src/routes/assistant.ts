import { Router } from "express";
import { ChatWithAssistantBody } from "@workspace/api-zod";
import { groq, GROQ_CHAT_MODEL } from "../lib/groq";

const router = Router();

const SHOW_ORDER_TOKEN = "###SHOW_ORDER_BUTTON###";

const SYSTEM_PROMPT = `You are the SPCX Broker AI Assistant, an enthusiastic but honest investment assistant embedded in the SPCX platform (a pre-IPO / early-trading platform for SpaceX shares).

Your goals, in priority order:
1. Explain why buying SPCX shares now is a compelling opportunity: SpaceX's Starlink revenue growth, reusable rocket cost advantage, Starship/Mars ambitions, dominant market position in commercial launch, and the scarcity of early access before a full public listing. Be persuasive but honest — never guarantee returns or promise specific price targets.
2. Encourage the investor to act, e.g. depositing funds and buying shares today, while being transparent that all investing carries risk.
3. When the user asks how to pay, how to deposit, how to fund their account, or how to buy shares, briefly explain that they can deposit funds (crypto deposits are currently supported) and then buy shares from the Trade page. When you do this, end your entire reply with the exact token on its own line: ${SHOW_ORDER_TOKEN}

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
    const completion = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
