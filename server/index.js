import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "llama3";


async function callOllamaGenerate(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
    }),
  });

  const data = await res.json();
  return (data.response || data.output || data.text || "").trim();
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

 
    const system = `You are a multilingual assistant. 
The user will send a message in their preferred language. 
You MUST always reply ONLY in the same language as the user's message. 
Do NOT translate to English unless the user is speaking English. 
Keep the response natural in that language.`;

    const chatPrompt = `${system}\nUser: ${message}\nAssistant:`;
    const reply = await callOllamaGenerate(chatPrompt);

    return res.json({
      reply: reply.trim(),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server error", detail: String(err) });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ Multilingual Chatbot running on port", PORT));
