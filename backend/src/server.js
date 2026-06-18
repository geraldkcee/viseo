import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit"; // Upgrade 1: Rate limiter import
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Upgrade 2: Secure CORS to only allow your trusted frontend domain
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://viseo-sigma.vercel.app",
    ],
    methods: ["POST"],
    credentials: true,
  }),
);

app.use(express.json());

// Upgrade 1: Rate limit configuration (Max 5 requests per minute per IP address)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    error:
      "Too many content requests. Please wait a minute before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Apply the rate limiter directly to your generative route
app.post("/api/generate", apiLimiter, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res
      .status(400)
      .json({ error: "Topic field is completely required." });
  }

  try {
    const prompt = `You are an expert TikTok and Instagram Reels growth strategist. 
    The user wants content ideas about: "${topic}".
    Generate exactly 4 creative, highly engaging video concept series. 
    Each concept must have an attention-grabbing hook and 4-6 highly targeted trending hashtags.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            series: {
              type: Type.ARRAY,
              description: "List of exactly 4 video concepts.",
              items: {
                type: Type.OBJECT,
                properties: {
                  hook: {
                    type: Type.STRING,
                    description:
                      "A viral, scroll-stopping visual or verbal video hook statement.",
                  },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description:
                      "A list of 4 to 6 optimized hashtags specific to this exact hook.",
                  },
                },
                required: ["hook", "hashtags"],
              },
            },
          },
          required: ["series"],
        },
      },
    });

    // Upgrade 3: Safe JSON parsing safeguards to avoid server crashes
    try {
      const resultJson = JSON.parse(response.text);
      res.json(resultJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON:", response.text);
      res.status(502).json({
        error: "The AI engine returned an unreadable layout. Please try again.",
      });
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate your concepts. Try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend spinning flawlessly on http://localhost:${PORT}`);
});
