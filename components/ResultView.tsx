import React, { useState } from 'react';
import { StoryData } from '../types';
import { Button, Card } from './ui';
import { Copy, Download, BookOpen, User, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ResultViewProps { story: StoryData; onBack: () => void; }

export function writeWrappedText(doc: jsPDF, text: string, x: number, startY: number, maxWidth: number, lineHeight: number, bottomMargin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  let y = startY;
  for (const line of lines) {
    if (y + lineHeight > pageHeight - bottomMargin) { doc.addPage(); y = 20; }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export const ResultView: React.FC<ResultViewProps> = ({ story, onBack }) => {
  const [actionStatus, setActionStatus] = useState('');
  const inspirations = Array.isArray(story.inspirations) ? story.inspirations : [];
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(`${story.title}\n\n${story.content}`); setActionStatus('Story copied to clipboard.'); }
    catch (error) { console.error('Clipboard copy failed:', error); setActionStatus('Copy failed. Check browser clipboard permissions and try again.'); }
  };
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF(), margin = 20, width = doc.internal.pageSize.getWidth() - margin * 2, bottom = 20;
      let y = 20;
      doc.setFontSize(24); doc.setFont('times', 'bold');
      y = writeWrappedText(doc, story.title, margin, y, width, 10, bottom) + 10;
      doc.setFontSize(12); doc.setFont('times', 'normal');
      for (const paragraph of story.content.split('\n').filter(p => p.trim())) y = writeWrappedText(doc, paragraph, margin, y, width, 7, bottom) + 5;
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      y = writeWrappedText(doc, 'Inspirations', margin, y + 5, width, 9, bottom) + 3;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      for (const inspiration of inspirations) y = writeWrappedText(doc, `${inspiration.book} by ${inspiration.author} (${inspiration.year})\n${inspiration.context}`, margin, y, width, 6, bottom) + 4;
      doc.save('findingstories-story.pdf');
      setActionStatus('PDF downloaded.');
    } catch (error) { console.error('PDF generation failed:', error); setActionStatus('PDF download failed. Please try again.'); }
  };
  const paragraphs = story.content.split('\n').filter(p => p.trim());

  return <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
    <div className="flex justify-between items-center"><Button variant="ghost" onClick={onBack}>← Back</Button><div className="flex gap-2"><Button variant="secondary" onClick={handleCopy} className="!px-4 !py-2"><Copy size={16} className="mr-2" /> Copy</Button><Button variant="secondary" onClick={handleDownloadPDF} className="!px-4 !py-2"><Download size={16} className="mr-2" /> PDF</Button></div></div>
    {actionStatus && <p role="status" aria-live="polite" className="text-sm text-[#666]">{actionStatus}</p>}
    <div className="space-y-8"><Card className="p-8 md:p-16 bg-white shadow-xl"><h1 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-12 leading-tight tracking-tight text-center">{story.title}</h1><div className="prose prose-xl max-w-none text-[#1D1D1F]/90 leading-loose" style={{ fontFamily: "'Merriweather', serif" }}>{paragraphs.map((paragraph, idx) => <p key={idx} className={`mb-6 text-lg md:text-xl font-light text-gray-800 ${idx === 0 ? "first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:text-[#1D1D1F]" : ""}`}>{paragraph}</p>)}</div><div className="mt-12 flex justify-center"><div className="w-16 h-1 bg-[#D1D1D6] rounded-full opacity-30" /></div></Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="col-span-full"><h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-4 pl-1">Inspired By</h3></div>{inspirations.map((insp, i) => { const authorLink = insp.authorUrl || `https://www.google.com/search?q=${encodeURIComponent(insp.author + ' biography')}`; return <Card key={i} className="p-6 transition-transform duration-300 hover:scale-[1.01]"><div className="flex flex-col gap-2"><div className="flex items-start justify-between"><span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800"><BookOpen size={12} className="mr-1" /> Source {i + 1}</span><span className="text-xs text-[#86868B] flex items-center"><Calendar size={12} className="mr-1" /> {insp.year}</span></div><h4 className="font-semibold text-lg text-[#1D1D1F] mt-2">{insp.book}</h4><div className="flex items-center text-sm text-[#86868B]"><User size={14} className="mr-1" /><a href={authorLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#0071E3] hover:underline transition-colors decoration-1 underline-offset-2 font-medium" title={`Read biography of ${insp.author}`}>{insp.author}</a></div><p className="text-sm text-[#1D1D1F]/70 mt-3 pt-3 border-t border-gray-100 italic">"{insp.context}"</p></div></Card>; })}</div>
    </div>
  </div>;
};
