import React, { useRef } from 'react';
import { StoryData } from '../types';
import { Button, Card } from './ui';
import { Copy, Download, BookOpen, User, Calendar } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ResultViewProps {
  story: StoryData;
  onBack: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ story, onBack }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const textToCopy = `${story.title}\n\n${story.content}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Story copied to clipboard.");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Title
    doc.setFontSize(24);
    doc.setFont("times", "bold"); // Use serif font for PDF too
    const titleLines = doc.splitTextToSize(story.title, maxLineWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 10 + 10;

    // Content
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    const contentLines = doc.splitTextToSize(story.content, maxLineWidth);
    doc.text(contentLines, margin, yPos);
    yPos += contentLines.length * 7 + 10;

    // Inspirations (if on new page needed)
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold"); // San serif for metadata
    doc.text("Inspirations", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    story.inspirations.forEach(insp => {
        const line = `${insp.book} by ${insp.author} (${insp.year})`;
        doc.text(line, margin, yPos);
        yPos += 7;
    });

    doc.save("findingstories-story.pdf");
  };

  // Filter out empty paragraphs
  const paragraphs = story.content.split('\n').filter(p => p.trim());

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
            ← Back
        </Button>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy} className="!px-4 !py-2">
                <Copy size={16} className="mr-2" /> Copy
            </Button>
            <Button variant="secondary" onClick={handleDownloadPDF} className="!px-4 !py-2">
                <Download size={16} className="mr-2" /> PDF
            </Button>
        </div>
      </div>

      <div ref={contentRef} className="space-y-8">
        <Card className="p-8 md:p-16 bg-white shadow-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-12 leading-tight tracking-tight text-center">
                {story.title}
            </h1>
            
            <div 
                className="prose prose-xl max-w-none text-[#1D1D1F]/90 leading-loose"
                style={{ fontFamily: "'Merriweather', serif" }}
            >
                {paragraphs.map((paragraph, idx) => (
                    <p 
                        key={idx} 
                        className={`mb-6 text-lg md:text-xl font-light text-gray-800 ${
                            idx === 0 
                            ? "first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:text-[#1D1D1F]" 
                            : ""
                        }`}
                    >
                        {paragraph}
                    </p>
                ))}
            </div>
            
            <div className="mt-12 flex justify-center">
                <div className="w-16 h-1 bg-[#D1D1D6] rounded-full opacity-30"></div>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
                <h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-4 pl-1">
                    Inspired By
                </h3>
            </div>
            {story.inspirations.map((insp, index) => {
                const authorLink = insp.authorUrl || `https://www.google.com/search?q=${encodeURIComponent(insp.author + ' biography')}`;
                
                return (
                    <Card key={index} className="p-6 transition-transform duration-300 hover:scale-[1.01]">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                    <BookOpen size={12} className="mr-1" />
                                    Source {index + 1}
                                </span>
                                <span className="text-xs text-[#86868B] flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    {insp.year}
                                </span>
                            </div>
                            <h4 className="font-semibold text-lg text-[#1D1D1F] mt-2">{insp.book}</h4>
                            <div className="flex items-center text-sm text-[#86868B]">
                                <User size={14} className="mr-1" />
                                <a 
                                    href={authorLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-[#0071E3] hover:underline transition-colors decoration-1 underline-offset-2 font-medium"
                                    title={`Read biography of ${insp.author}`}
                                >
                                    {insp.author}
                                </a>
                            </div>
                            <p className="text-sm text-[#1D1D1F]/70 mt-3 pt-3 border-t border-gray-100 italic">
                                "{insp.context}"
                            </p>
                        </div>
                    </Card>
                );
            })}
        </div>
      </div>
    </div>
  );
};