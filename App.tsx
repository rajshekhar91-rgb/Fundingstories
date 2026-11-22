import React, { useEffect, useState } from 'react';
import { Input, Button, Card } from './components/ui';
import { ResultView } from './components/ResultView';
import { generateStoryFromKeywords } from './services/geminiService';
import { loadHistory, saveHistory } from './services/history';
import { StoryData, HistoryItem } from './types';
import { Search, Sparkles, Clock, ChevronRight, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!saveHistory(history)) setErrorMessage('Your story was generated, but browser storage could not save it.');
  }, [history]);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanKeywords = keywords.trim().slice(0, 200);
    if (!cleanKeywords || isGenerating) return;
    setKeywords(cleanKeywords); setErrorMessage(''); setIsGenerating(true); setCurrentStory(null); setShowHistory(false);
    try {
      setLoadingStep('Generating story...');
      const story = await generateStoryFromKeywords(cleanKeywords);
      const safeStory = { ...story, inspirations: Array.isArray(story.inspirations) ? story.inspirations : [] };
      setCurrentStory(safeStory);
      setHistory(previous => [{ id: uuidv4(), timestamp: Date.now(), keywords: cleanKeywords, story: safeStory }, ...previous].slice(0, 20));
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong while finding stories. Please try again.');
    } finally { setIsGenerating(false); setLoadingStep(''); }
  };
  const loadFromHistory = (item: HistoryItem) => {
    setKeywords(item.keywords); setCurrentStory({ ...item.story, inspirations: Array.isArray(item.story.inspirations) ? item.story.inspirations : [] }); setShowHistory(false); setErrorMessage('');
  };
  const resetView = () => { setCurrentStory(null); setKeywords(''); setErrorMessage(''); };

  return <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-20">
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200/50"><div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
      <button type="button" className="flex items-center gap-2 font-semibold text-xl tracking-tight cursor-pointer" onClick={resetView} aria-label="Findingstories home"><span className="bg-[#1D1D1F] text-white p-1 rounded-lg"><Sparkles size={16} /></span>findingstories</button>
      <button type="button" onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-gray-200' : 'hover:bg-gray-100'}`} aria-label="Toggle history" aria-expanded={showHistory}><Clock size={20} /></button>
    </div></nav>
    <main className="max-w-5xl mx-auto px-6 py-12">
      {showHistory ? <section><div className="flex items-center justify-between mb-8"><h2 className="text-3xl font-bold">Your Library</h2><Button variant="ghost" onClick={() => setShowHistory(false)}>Close</Button></div>
        {history.length === 0 ? <div className="text-center py-20 text-[#86868B]">No stories yet.</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{history.map(item => <Card key={item.id} className="p-6 cursor-pointer hover:shadow-md group" onClick={() => loadFromHistory(item)}><div className="flex justify-between items-start"><div><h3 className="font-semibold text-lg mb-1 group-hover:text-[#0071E3]">{item.story.title}</h3><p className="text-sm text-[#86868B] line-clamp-2 mb-3">{item.story.content}</p><div className="flex gap-2">{item.story.inspirations.slice(0, 2).map((insp, i) => <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600">{insp.author}</span>)}</div></div><ChevronRight /></div></Card>)}</div>}
      </section> : currentStory ? <ResultView story={currentStory} onBack={resetView} /> : <section className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
        <div className="space-y-4 max-w-2xl"><h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#1D1D1F] to-[#424245] pb-2">Stories found in history.</h1><p className="text-xl md:text-2xl text-[#86868B] font-light leading-relaxed">Enter keywords to weave a narrative inspired by the world's greatest biographies.</p></div>
        <form onSubmit={handleGenerate} className="w-full max-w-xl space-y-6"><div className="relative group w-full"><Input placeholder="e.g. apple, garage, innovation, betrayal" value={keywords} onChange={e => setKeywords(e.target.value.slice(0, 200))} disabled={isGenerating} maxLength={200} aria-label="Enter keywords" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />{keywords && !isGenerating && <button type="button" onClick={() => setKeywords('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5" aria-label="Clear keywords"><X size={16} /></button>}</div><Button type="submit" disabled={!keywords.trim() || isGenerating} isLoading={isGenerating} className="w-full md:w-auto min-w-[160px]">{isGenerating ? '' : 'Find Story'}</Button></form>
        {isGenerating && <p className="text-sm text-[#86868B]" aria-live="polite">{loadingStep}</p>}{errorMessage && <p role="alert" aria-live="assertive" className="text-sm text-red-700">{errorMessage}</p>}
        <p className="pt-12 text-xs text-[#86868B]">Stories are generated by AI and may contain inaccuracies.</p>
        <div className="pt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-center opacity-40"><div className="text-xs uppercase tracking-widest font-semibold">Walter Isaacson</div><div className="text-xs uppercase tracking-widest font-semibold">Robert Caro</div><div className="text-xs uppercase tracking-widest font-semibold">Ron Chernow</div><div className="text-xs uppercase tracking-widest font-semibold">David McCullough</div></div>
      </section>}
    </main>
  </div>;
}
export default App;
