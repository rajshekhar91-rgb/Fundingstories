import { GoogleGenAI } from "@google/genai";
import { StoryData } from "../types";

// Ensure we have an API key from the environment
const apiKey = process.env.API_KEY || '';

export const generateStoryFromKeywords = async (keywords: string): Promise<StoryData> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Using gemini-2.5-flash for speed and search capabilities
  const model = "gemini-2.5-flash";

  const prompt = `
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

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is NOT allowed with googleSearch
        // We rely on the prompt to format JSON.
      },
    });

    let text = response.text || "";
    
    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text) as StoryData;
    return data;
  } catch (error) {
    console.error("Story generation failed:", error);
    throw new Error("Failed to craft your story. Please try again.");
  }
};