import { describe, expect, it } from 'vitest';
import { StorySchema } from '../shared/storySchema';

describe('StorySchema', () => {
  it('accepts the existing story response shape', () => {
    expect(StorySchema.parse({ title: 'A title', content: 'Story text', inspirations: [{ author: 'A', book: 'B', year: '1920', context: 'Related', authorUrl: 'https://example.com' }] })).toMatchObject({ title: 'A title', inspirations: [{ author: 'A' }] });
  });
  it('defaults missing inspirations to an empty array', () => {
    expect(StorySchema.parse({ title: 'A title', content: 'Story text' }).inspirations).toEqual([]);
  });
  it('rejects missing required story fields', () => {
    expect(StorySchema.safeParse({ title: '', content: 'text' }).success).toBe(false);
  });
});
