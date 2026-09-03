import OpenAI from "openai";

// Groq exposes an OpenAI-compatible chat completions API, so we reuse the
// official OpenAI SDK pointed at Groq's base URL with the user's Groq key.
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const GROQ_CHAT_MODEL = "openai/gpt-oss-120b";
