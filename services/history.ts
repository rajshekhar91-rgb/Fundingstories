import { HistoryItem } from '../types';

export const HISTORY_KEY = 'findingstories_history';

export function loadHistory(storage: Pick<Storage, 'getItem'> = localStorage): HistoryItem[] {
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is HistoryItem =>
      item && typeof item.id === 'string' && typeof item.timestamp === 'number' &&
      typeof item.keywords === 'string' && item.story &&
      typeof item.story.title === 'string' && typeof item.story.content === 'string'
    ).map(item => ({
      ...item,
      story: { ...item.story, inspirations: Array.isArray(item.story.inspirations) ? item.story.inspirations : [] },
    })).slice(0, 20);
  } catch (error) {
    console.error('Failed to load story history:', error);
    return [];
  }
}

export function saveHistory(history: HistoryItem[], storage: Pick<Storage, 'setItem'> = localStorage): boolean {
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    return true;
  } catch (error) {
    console.error('Failed to save story history:', error);
    return false;
  }
}
