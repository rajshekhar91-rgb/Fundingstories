export interface Inspiration {
  author: string;
  book: string;
  year: string;
  context: string;
  authorUrl?: string;
}

export interface StoryData {
  title: string;
  content: string;
  inspirations: Inspiration[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  keywords: string;
  story: StoryData;
}