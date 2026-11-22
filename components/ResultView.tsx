import React, { useState } from 'react';
import { StoryData } from '../types';
import { Button } from './ui';
import { jsPDF } from 'jspdf';

interface ResultViewProps { story: StoryData; onBack: () => void; }

export function writeWrappedText(doc: jsPDF, text: string, x: number, startY: number, maxWidth: number, lineHeight: number, bottomMargin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  let y = startY;
  for (const line of lines) {
    if (y + lineHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export const ResultView: React.FC<ResultViewProps> = ({ story, onBack }) => {
  const [actionStatus, setActionStatus] = useState('');
  const inspirations = Array.isArray(story.inspirations) ? story.inspirations : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${story.title}\n\n${story.content}`);
      setActionStatus('Story copied to clipboard.');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      setActionStatus('Copy failed. Check browser clipboard permissions and try again.');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      const bottom = 20;
      let y = 20;

      doc.setFontSize(24);
      doc.setFont('times', 'bold');
      y = writeWrappedText(doc, story.title, margin, y, width, 10, bottom) + 10;
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      for (const paragraph of story.content.split('\n').filter(part => part.trim())) {
        y = writeWrappedText(doc, paragraph, margin, y, width, 7, bottom) + 5;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      y = writeWrappedText(doc, 'Inspirations', margin, y + 5, width, 9, bottom) + 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      for (const inspiration of inspirations) {
        const entry = `${inspiration.book} by ${inspiration.author} (${inspiration.year})\n${inspiration.context}`;
        y = writeWrappedText(doc, entry, margin, y, width, 6, bottom) + 4;
      }
      doc.save('findingstories-story.pdf');
      setActionStatus('PDF downloaded.');
    } catch (error) {
      console.error('PDF generation failed:', error);
      setActionStatus('PDF download failed. Please try again.');
    }
  };

  return (
    <article className="result-page">
      <div className="result-actions">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <div className="action-links">
          <button type="button" className="text-link" onClick={handleCopy}>Copy story</button>
          <button type="button" className="text-link" onClick={handleDownloadPDF}>Download PDF →</button>
        </div>
      </div>
      {actionStatus && <p className="action-status" role="status" aria-live="polite">{actionStatus}</p>}
      <div className="story-reading-column">
        <h1 className="story-title">{story.title}</h1>
        <div className="story-content">
          {story.content.split('\n').filter(part => part.trim()).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <section className="inspirations-section" aria-labelledby="inspirations-heading">
          <h2 id="inspirations-heading">Inspirations</h2>
          {inspirations.length === 0 ? <p className="empty-state">No inspirations were returned for this story.</p> : (
            <div className="table-scroll">
              <table className="inspirations-table">
                <thead><tr><th scope="col">Author</th><th scope="col">Work</th><th scope="col">Why it relates</th></tr></thead>
                <tbody>{inspirations.map((inspiration, index) => (
                  <tr key={index}>
                    <td>{inspiration.authorUrl ? <a href={inspiration.authorUrl} target="_blank" rel="noreferrer">{inspiration.author}</a> : inspiration.author}</td>
                    <td>{inspiration.book}<span className="publication-year">{inspiration.year}</span></td>
                    <td>{inspiration.context}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </article>
  );
};
