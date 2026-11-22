import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HISTORY_KEY, loadHistory, saveHistory } from '../services/history';
import { HistoryItem } from '../types';

const item: HistoryItem = { id: '1', timestamp: 1, keywords: 'test', story: { title: 'Title', content: 'Text', inspirations: [] } };

describe('history storage', () => {
  beforeEach(() => localStorage.clear());
  it('saves and loads the existing history key', () => {
    expect(saveHistory([item])).toBe(true);
    expect(localStorage.getItem(HISTORY_KEY)).not.toBeNull();
    expect(loadHistory()).toEqual([item]);
  });
  it('keeps only the newest 20 items', () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ ...item, id: String(i) }));
    saveHistory(items);
    expect(loadHistory()).toHaveLength(20);
  });
  it('recovers from invalid JSON and storage failures', () => {
    localStorage.setItem(HISTORY_KEY, '{');
    expect(loadHistory()).toEqual([]);
    const failingStorage = { setItem: vi.fn(() => { throw new Error('quota'); }) };
    expect(saveHistory([item], failingStorage as unknown as Storage)).toBe(false);
  });
});
