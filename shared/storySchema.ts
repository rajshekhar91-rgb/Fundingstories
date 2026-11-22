import { z } from 'zod';

export const InspirationSchema = z.object({
  author: z.string(),
  book: z.string(),
  year: z.string(),
  context: z.string(),
  authorUrl: z.string().url().optional(),
});

export const StorySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  inspirations: z.array(InspirationSchema).default([]),
});

export type ValidatedStory = z.infer<typeof StorySchema>;
