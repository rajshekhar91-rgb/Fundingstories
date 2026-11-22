import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateStoryFromKeywords } from '../services/geminiService';

afterEach(() => vi.unstubAllGlobals());

describe('story generation flow', () => {
  it('posts keywords to the server endpoint and returns its story', async () => {
    const story = { title: 'Title', content: 'Text', inspirations: [] };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => story });
    vi.stubGlobal('fetch', fetchMock);
    await expect(generateStoryFromKeywords('  idea  ')).resolves.toEqual(story);
    expect(fetchMock).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ keywords: 'idea' }),
    }));
  });
  it('surfaces API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Rate limited' }) }));
    await expect(generateStoryFromKeywords('idea')).rejects.toThrow('Rate limited');
  });
});
