import React, { useState, useEffect } from 'react';
import { Input, Button, Card } from './components/ui';
import { ResultView } from './components/ResultView';
import { generateStoryFromKeywords } from './services/geminiService';
import { StoryData, HistoryItem } from './types';
import { Search, Sparkles, Clock, ChevronRight, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // State
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('findingstories_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('findingstories_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    setIsGenerating(true);
    setCurrentStory(null);
    setShowHistory(false);

    try {
      setLoadingStep('Crafting your story from literary giants...');
      const story = await generateStoryFromKeywords(keywords);
      
      setCurrentStory(story);

      // Add to history
      const newItem: HistoryItem = {
        id: uuidv4(),
        timestamp: Date.now(),
        keywords,
        story
      };
      
      setHistory(prev => {
         const newHistory = [newItem, ...prev];
         // Only keep last 20
         return newHistory.slice(0, 20); 
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong while finding stories. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setKeywords(item.keywords);
    setCurrentStory(item.story);
    setShowHistory(false);
  };

  const resetView = () => {
    setCurrentStory(null);
    setKeywords('');
  };

  const clearSearch = () => {
    setKeywords('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-20">
      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-semibold text-xl tracking-tight cursor-pointer"
            onClick={resetView}
          >
            <span className="bg-[#1D1D1F] text-white p-1 rounded-lg">
                <Sparkles size={16} />
            </span>
            findingstories
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Clock size={20} className="text-[#1D1D1F]" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* History Overlay */}
        {showHistory ? (
           <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold tracking-tight">Your Library</h2>
               <Button variant="ghost" onClick={() => setShowHistory(false)}>Close</Button>
             </div>
             {history.length === 0 ? (
               <div className="text-center py-20 text-[#86868B]">
                 <p className="text-lg">No stories yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {history.map(item => (
                   <Card key={item.id} className="p-6 cursor-pointer hover:shadow-md transition-all group" onClick={() => loadFromHistory(item)}>
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-semibold text-lg mb-1 group-hover:text-[#0071E3] transition-colors">
                           {item.story.title}
                         </h3>
                         <p className="text-sm text-[#86868B] line-clamp-2 mb-3">
                           {item.story.content}
                         </p>
                         <div className="flex gap-2">
                             {item.story.inspirations.slice(0, 2).map((insp, i) => (
                                 <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                                     {insp.author}
                                 </span>
                             ))}
                         </div>
                       </div>
                       <ChevronRight className="text-gray-300 group-hover:text-[#0071E3] transition-colors" />
                     </div>
                   </Card>
                 ))}
               </div>
             )}
           </div>
        ) : (
          <>
            {/* Story View */}
            {currentStory ? (
              <ResultView 
                story={currentStory} 
                onBack={resetView} 
              />
            ) : (
              /* Search/Input View */
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-fade-in">
                
                <div className="space-y-4 max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#1D1D1F] to-[#424245] pb-2">
                    Stories found in history.
                  </h1>
                  <p className="text-xl md:text-2xl text-[#86868B] font-light leading-relaxed">
                    Enter keywords to weave a narrative inspired by the world's greatest biographies.
                  </p>
                </div>

                <form onSubmit={handleGenerate} className="w-full max-w-xl space-y-6">
                  <div className="relative group w-full">
                    <Input 
                      placeholder="e.g. apple, garage, innovation, betrayal" 
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      disabled={isGenerating}
                      className="pl-12 pr-10 shadow-lg shadow-black/5"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                    
                    {keywords && !isGenerating && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100 rounded-full transition-colors"
                        title="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                    <Button 
                        type="submit" 
                        disabled={!keywords || isGenerating}
                        isLoading={isGenerating}
                        className="w-full md:w-auto min-w-[160px]"
                    >
                        {isGenerating ? '' : 'Find Story'}
                    </Button>
                  </div>
                </form>
                
                {isGenerating && (
                    <div className="text-sm text-[#86868B] animate-pulse">
                        {loadingStep}
                    </div>
                )}
                
                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center opacity-40">
                    <div className="text-xs uppercase tracking-widest font-semibold">Walter Isaacson</div>
                    <div className="text-xs uppercase tracking-widest font-semibold">Robert Caro</div>
                    <div className="text-xs uppercase tracking-widest font-semibold">Ron Chernow</div>
                    <div className="text-xs uppercase tracking-widest font-semibold">David McCullough</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;