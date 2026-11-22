import { StoryData } from "../types";

export const generateStoryFromKeywords = async (keywords: string): Promise<StoryData> => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: keywords.trim().slice(0, 200) }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to craft your story. Please try again.";
    throw new Error(message);
  }

  return payload as StoryData;
};
