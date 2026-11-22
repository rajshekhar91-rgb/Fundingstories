import { describe, expect, it, vi } from 'vitest';
import { writeWrappedText } from '../components/ResultView';
import type { jsPDF } from 'jspdf';

describe('writeWrappedText', () => {
  it('adds a page when wrapped lines cross the bottom margin', () => {
    const doc = {
      internal: { pageSize: { getHeight: () => 100 } },
      splitTextToSize: vi.fn(() => ['one', 'two', 'three']),
      text: vi.fn(),
      addPage: vi.fn(),
    } as unknown as jsPDF;
    const finalY = writeWrappedText(doc, 'long text', 10, 80, 50, 10, 10);
    expect(doc.addPage).toHaveBeenCalledTimes(1);
    expect(doc.text).toHaveBeenCalledTimes(3);
    expect(finalY).toBe(50);
  });
});
