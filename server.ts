import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
// Guard with lazy check, handle missing key gracefully
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the host environment. Please set it in the Settings > Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint to process student permission request
app.post("/api/analyze-permission", async (req, res) => {
  try {
    const { studentMessage, policyRules, systemPrompt } = req.body;

    if (!studentMessage || typeof studentMessage !== "string" || !studentMessage.trim()) {
      return res.status(400).json({ error: "Pesan mahasiswa wajib diisi." });
    }

    const ai = getGeminiClient();

    // Construct detailed instruction using customizable rules & prompt
    const instructions = `
You are a professional, polite, and firm assistant to a university lecturer.
Your job is to analyze student permission letters/messages (WhatsApp, email, etc.) and generate:
1. An official status of the request: "Disetujui" (Approved), "Perlu Dokumen Tambahan" (Needs Additional Documents), or "Ditolak" (Rejected).
2. A polished, polite, and formal Indonesia language draft response following the guidance rules.
3. Extracted primary details (Name, NIM (Student ID Number), Reason, and Duration).
4. A brief, polite explanation of the decision.
5. A sentiment and emotional tone of the student's message, categorized as exactly 'Sopan' (Polite), 'Formal' (Official), 'Mendesak' (Urgent), 'Panik' (Panicked), or 'Kurang Sopan' (Impulsive/impolite) depending on the greeting, punctuation, vocabulary, and attitude.

Here is the supervisor's system prompt (tone and basic flow instruction):
"""
${systemPrompt || ""}
"""

Here are the policy rules you MUST enforce:
"""
${(policyRules || []).map((rule: string, idx: number) => `${idx + 1}. ${rule}`).join("\n")}
"""

Student message to analyze:
"""
${studentMessage}
"""

Ensure the reply ALWAYS closes politely and follows the system instruction exactly.
Default greeting format: "Halo [Nama Mahasiswa]," or "Selamat pagi/siang/sore [Nama Mahasiswa],"
Translate any English concepts appropriately. If NIM or duration is missing or unclear, indicate that in extractedInfo or ask for it politely in the reply.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructions,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["status", "draftReply", "reason", "extractedInfo", "sentiment"],
          properties: {
            status: {
              type: Type.STRING,
              description: "Status evaluation of the permission. Must be exactly 'Disetujui', 'Perlu Dokumen Tambahan', or 'Ditolak'.",
            },
            sentiment: {
              type: Type.STRING,
              description: "Sentiment tone of the message. Must be exactly 'Sopan', 'Formal', 'Mendesak', 'Panik', or 'Kurang Sopan'.",
            },
            draftReply: {
              type: Type.STRING,
              description: "The complete, highly professional draft response in Indonesian.",
            },
            reason: {
              type: Type.STRING,
              description: "Brief reason for the decision, mapping to specific policy rules in regular Indonesian.",
            },
            extractedInfo: {
              type: Type.OBJECT,
              required: ["name", "nim", "reason", "duration"],
              properties: {
                name: { type: Type.STRING, description: "Extracted student name, or 'Tidak ditemukan'" },
                nim: { type: Type.STRING, description: "Extracted NIM (student registration number), or 'Tidak ditemukan'" },
                reason: { type: Type.STRING, description: "Extracted reason of leave, or 'Tidak ditemukan'" },
                duration: { type: Type.STRING, description: "Extracted duration or date of absence, or 'Tidak ditemukan'" },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text || "{}";
    const parsedResult = JSON.parse(jsonText.trim());

    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Error analyzing permission:", error);
    return res.status(500).json({
      error: error.message || "Terjadi kesalahan internal ketika memproses pesan dengan AI.",
    });
  }
});

// Serve frontend
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
