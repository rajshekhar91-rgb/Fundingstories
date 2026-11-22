import React, { useEffect, useState } from 'react';
import { Input, Button } from './components/ui';
import { ResultView } from './components/ResultView';
import { generateStoryFromKeywords } from './services/geminiService';
import { loadHistory, saveHistory } from './services/history';
import { StoryData, HistoryItem } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
    setKeywords(cleanKeywords);
    setErrorMessage('');
    setIsGenerating(true);
    setCurrentStory(null);
    setShowHistory(false);
    try {
      const story = await generateStoryFromKeywords(cleanKeywords);
      const safeStory = { ...story, inspirations: Array.isArray(story.inspirations) ? story.inspirations : [] };
      setCurrentStory(safeStory);
      setHistory(previous => [{ id: uuidv4(), timestamp: Date.now(), keywords: cleanKeywords, story: safeStory }, ...previous].slice(0, 20));
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong while finding stories. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openHistoryItem = (item: HistoryItem) => {
    setKeywords(item.keywords);
    setCurrentStory({ ...item.story, inspirations: Array.isArray(item.story.inspirations) ? item.story.inspirations : [] });
    setShowHistory(false);
    setErrorMessage('');
  };

  const clearHistory = () => {
    setHistory([]);
    setErrorMessage('');
  };

  const goHome = () => {
    setCurrentStory(null);
    setKeywords('');
    setShowHistory(false);
    setErrorMessage('');
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <button type="button" className="wordmark" onClick={goHome}>Fundingstories</button>
          <button type="button" className="nav-link" onClick={() => { setShowHistory(!showHistory); setCurrentStory(null); }}>
            {showHistory ? 'Find a story' : 'History'}
          </button>
        </nav>
      </header>

      <main className="main-content">
        {showHistory ? (
          <section className="history-section" aria-labelledby="history-heading">
            <div className="section-heading">
              <h1 id="history-heading">History</h1>
              {history.length > 0 && <button type="button" className="text-link" onClick={clearHistory}>Clear history</button>}
            </div>
            {history.length === 0 ? (
              <p className="empty-state">No stories saved yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="history-table">
                  <thead><tr><th scope="col">Date</th><th scope="col">Keywords</th><th scope="col">Title</th></tr></thead>
                  <tbody>
                    {history.map(item => (
                      <tr key={item.id}>
                        <td>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(item.timestamp)}</td>
                        <td>{item.keywords}</td>
                        <td><button type="button" className="table-link" onClick={() => openHistoryItem(item)}>{item.story.title}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : currentStory ? (
          <ResultView story={currentStory} onBack={goHome} />
        ) : (
          <section className="hero-section" aria-labelledby="page-heading">
            <div className="hero-copy">
              <h1 id="page-heading">Find a story</h1>
              <p>Enter keywords to generate a story inspired by biographies and literary history.</p>
            </div>
            <form className="search-form" onSubmit={handleGenerate}>
              <label htmlFor="keywords">Enter keywords</label>
              <Input id="keywords" placeholder="e.g. apple, garage, innovation, betrayal" value={keywords} onChange={event => setKeywords(event.target.value.slice(0, 200))} disabled={isGenerating} maxLength={200} required />
              <div className="form-actions">
                <Button type="submit" disabled={!keywords.trim() || isGenerating} isLoading={false}>Find story</Button>
                <span className="character-count">{keywords.length}/200</span>
              </div>
            </form>
            {isGenerating && <p className="loading-message" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Generating story...</p>}
            {errorMessage && <p className="error-message" role="alert" aria-live="assertive">{errorMessage}</p>}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-column"><span className="footer-heading">Fundingstories</span><p>Stories generated from keywords and literary history.</p></div>
          <div className="footer-column"><span className="footer-heading">Project</span><a href="https://github.com/rajshekhar91-rgb/Fundingstories" target="_blank" rel="noreferrer">Source code</a><button type="button" onClick={() => { setShowHistory(true); setCurrentStory(null); }}>History</button></div>
          <div className="footer-column"><span className="footer-heading">Note</span><p>Stories are generated by AI and may contain inaccuracies.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default App;
