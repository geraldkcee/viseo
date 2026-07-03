import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Explicit Environment Sanity Check
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "❌ SETUP FAILED: GEMINI_API_KEY environment variable missing from system environments.",
  );
}

// 🔒 Enhanced Whitelist Router Logic
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://viseo-sigma.vercel.app/", // Matches your production deployment directly
    ],
    methods: ["POST", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());

// Defensive Operations: Enforce strict API limit parameter constraints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // Max 5 requests per minute per IP address
  handler: (req, res) => {
    return res.status(429).json({
      error:
        "Too many content requests. Please wait a minute before trying again.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🛠️ FIX FOR THE "<!DOCTYPE" MISMATCH: Handle base paths natively to avoid returning default HTML index pages
app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ status: "Viseo API Engine online and functioning." });
});

app.post("/api/generate", apiLimiter, async (req, res) => {
  const { topic } = req.body;

  // Strict Data Type Input Validation
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res
      .status(400)
      .json({ error: "Topic field is completely required." });
  }

  try {
    const systemPrompt = `You are an expert short-form content strategist and viral copywriter. 
Your task is to take the raw topic or niche provided by the user and expand it into three distinct, high-retention content angles.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User Topic to expand: "${topic.trim()}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.75, // Keeps JSON delivery structurally accurate
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            controversial: {
              type: Type.OBJECT,
              properties: {
                hook: {
                  type: Type.STRING,
                  description:
                    "A polarizing, pattern-interrupting hook under 10 words.",
                },
                body: {
                  type: Type.STRING,
                  description:
                    "A compelling 3-sentence script body that delivers on the hook without being clickbait.",
                },
                visualDirection: {
                  type: Type.STRING,
                  description:
                    "Text description of what the creator should be doing visually on screen.",
                },
              },
              required: ["hook", "body", "visualDirection"],
            },
            analogy: {
              type: Type.OBJECT,
              properties: {
                hook: {
                  type: Type.STRING,
                  description:
                    "A highly relatable, punchy hook comparing the topic to an everyday object or situation.",
                },
                body: {
                  type: Type.STRING,
                  description:
                    "A 4-sentence explanation using a brilliant, simple analogy.",
                },
                visualDirection: {
                  type: Type.STRING,
                  description:
                    "Visual instruction for a simple B-roll setup or physical gesture.",
                },
              },
              required: ["hook", "body", "visualDirection"],
            },
            caseStudy: {
              type: Type.OBJECT,
              properties: {
                hook: {
                  type: Type.STRING,
                  description:
                    "A data-driven or results-oriented hook using numbers or transformation proof.",
                },
                body: {
                  type: Type.STRING,
                  description:
                    "A 4-sentence breakdown covering the struggle (before), the secret mechanism (how), and the outcome (after).",
                },
                visualDirection: {
                  type: Type.STRING,
                  description:
                    "Instruction on what text graphics or screenshots to overlay.",
                },
              },
              required: ["hook", "body", "visualDirection"],
            },
          },
          required: ["controversial", "analogy", "caseStudy"],
        },
      },
    });

    if (!response || !response.text) {
      return res.status(502).json({
        error:
          "Empty processing parameters received from downstream AI cluster.",
      });
    }

    try {
      const resultJson = JSON.parse(response.text);
      return res.status(200).json({ success: true, data: resultJson });
    } catch (parseError) {
      console.error("Format Parser Crash. Content trace:", response.text);
      return res.status(502).json({
        error:
          "The AI engine returned an unreadable schema layout. Please retry.",
      });
    }
  } catch (error) {
    console.error("Gemini Production Cluster Error Intercepted:", error);
    return res.status(500).json({
      error:
        "An internal server issue occurred while running optimization matrix algorithms.",
    });
  }
});

// 🛠️ CATCH-ALL ROUTE FIX: Prevents returning standard HTML 404 pages when an invalid path is hit
app.use((req, res) => {
  return res.status(404).json({
    error:
      "The requested API routing path does not exist on this server environment.",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Viseo Node server active on port ${PORT}`);
});
