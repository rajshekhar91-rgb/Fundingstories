import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const InspirationSchema = z.object({
  author: z.string(),
  book: z.string(),
  year: z.string(),
  context: z.string(),
  authorUrl: z.string().url().optional(),
});

const StorySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  inspirations: z.array(InspirationSchema).default([]),
});

const RequestSchema = z.object({
  keywords: z.string().trim().min(1).max(200),
});

const MODEL = "gemini-2.5-flash";
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

// Keep this prompt and its response contract aligned with the original client service.
const buildPrompt = (keywords: string) => `
    Create a short story (approx 300-500 words) weaving together these keywords: "${keywords}".
    
    The writing style must be inspired by famous authors, biographies, or autobiographies.
    
    CRITICAL REQUIREMENT: You MUST use the 'googleSearch' tool to find real-world inspirations.
    Identify specific authors, books, and publication years that align with the themes of the user's keywords.
    
    Return the response as a valid JSON object with the following structure:
    {
      "title": "A creative title for the story",
      "content": "The full story text...",
      "inspirations": [
        {
          "author": "Name of the author inspired by",
          "book": "Title of the specific book/biography",
          "year": "Publication year",
          "context": "Brief explanation of how this connects to the story",
          "authorUrl": "URL to the author's biography (e.g., Wikipedia) found via Google Search"
        }
      ]
    }
    
    Do not wrap the JSON in markdown code blocks. Just return the raw JSON string if possible, or I will clean it.
  `;

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return value?.trim() || req.socket.remoteAddress || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = requestsByIp.get(ip);
  if (!current || current.resetAt <= now) {
    requestsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

async function generateValidatedStory(keywords: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Story generation is not configured on the server.");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(keywords);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      const text = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      return StorySchema.parse(parsed);
    } catch (error) {
      if (attempt === 1) {
        console.error("Story generation or validation failed:", error);
        throw new Error("Gemini returned an invalid story. Please try again.");
      }
    }
  }
  throw new Error("Failed to generate a valid story.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const parsedRequest = RequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    return res.status(400).json({ error: "Enter keywords (up to 200 characters)." });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  try {
    const story = await generateValidatedStory(parsedRequest.data.keywords);
    return res.status(200).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate story. Please try again.";
    const status = message.includes("not configured") ? 500 : 502;
    return res.status(status).json({ error: message });
  }
}
