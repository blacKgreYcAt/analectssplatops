import React, { useState, useEffect, useMemo } from 'react';
import { lessons, Lesson } from './data/lessons';
import StoryReader from './components/StoryReader';
import FlashcardGame from './components/FlashcardGame';
import PhoneticText from './components/PhoneticText';
import { Lock, Play, CheckCircle } from 'lucide-react';

type ViewState = 'world-select' | 'map' | 'story' | 'practice';

function App() {
  const [view, setViewState] = useState<ViewState>('world-select');
  const [currentWorld, setCurrentWorld] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('splatoon_analects_progress');
    if (saved) {
      setCompletedStages(JSON.parse(saved));
    }
  }, []);

  const handleComplete = (lessonId: string) => {
    const newCompleted = [...new Set([...completedStages, lessonId])];
    setCompletedStages(newCompleted);
    localStorage.setItem('splatoon_analects_progress', JSON.stringify(newCompleted));
    setViewState('map');
  };

  // Dynamically group lessons by world
  const worlds = [...new Set(lessons.map(l => l.world))].sort((a, b) => a - b);
  
  // Get unique world names/books
  const worldBooks = useMemo(() => {
    const map = new Map<number, string>();
    lessons.forEach(l => {
      if (!map.has(l.world)) map.set(l.world, l.book);
    });
    return map;
  }, []);

  if (view === 'story' && currentLesson) {
    return <StoryReader lesson={currentLesson} onNext={() => setViewState('practice')} onBack={() => setViewState('map')} />;
  }

  if (view === 'practice' && currentLesson) {
    return <FlashcardGame lesson={currentLesson} onComplete={() => handleComplete(currentLesson.id)} onBack={() => setViewState('story')} />;
  }

  if (view === 'map' && currentWorld !== null) {
    const worldLessons = lessons.filter(l => l.world === currentWorld);
    const worldColors = ['bg-splat-pink', 'bg-splat-green', 'bg-splat-cyan', 'bg-splat-yellow', 'bg-splat-purple'];
    const colorClass = worldColors[(currentWorld - 1) % worldColors.length];

    return (
      <div className="min-h-screen p-4 md:p-8">
        <header className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
          <button 
            onClick={() => setViewState('world-select')}
            className="bg-ink-black text-white px-4 py-2 font-display text-xl border-4 border-white brutal-shadow-pink transform -skew-x-6 hover:scale-105 transition-transform"
          >
            返回世界地圖
          </button>
          <h1 className="hidden md:block text-2xl font-display text-splat-yellow bg-ink-black px-4 py-2 border-4 border-white transform skew-x-3">
            WORLD {currentWorld}: <PhoneticText text={worldBooks.get(currentWorld) || ""} rtClassName="text-white/60" />
          </h1>
        </header>

        <main className="max-w-4xl mx-auto">
          <section className={`skew-container brutal-shadow border-4 border-ink-black p-4 md:p-8 ${colorClass}`}>
            <div className="unskew-content">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {worldLessons.map((lesson) => {
                  const globalIndex = lessons.findIndex(l => l.id === lesson.id);
                  const isFirstLevel = globalIndex === 0;
                  const previousLesson = lessons[globalIndex - 1];
                  // Open all worlds/stages
                  const isUnlocked = true;
                  const isCompleted = completedStages.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      disabled={!isUnlocked}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        setViewState('story');
                      }}
                      className={`relative border-4 border-ink-black p-4 text-left transition-transform ${
                        isUnlocked 
                          ? 'bg-white text-ink-black hover:-translate-y-2 hover:brutal-shadow cursor-pointer' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-80'
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 border-4 border-splat-pink text-splat-pink font-display text-lg md:text-2xl transform rotate-12 px-2 py-1 bg-white z-10 brutal-shadow text-center">
                          <PhoneticText text="已完成!" />
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-display text-lg md:text-xl bg-ink-black text-white px-2 py-1">
                          STAGE {lesson.stage}
                        </span>
                        {!isUnlocked && <Lock className="w-5 h-5 md:w-6 md:h-6" />}
                        {isUnlocked && !isCompleted && <Play className="w-5 h-5 md:w-6 md:h-6 text-splat-pink" />}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mt-2">
                        <PhoneticText text={lesson.title} />
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-12 md:mb-20 mt-8">
        <div className="relative inline-block w-full text-center">
          <h1 className="text-4xl md:text-8xl font-display text-splat-yellow brutal-shadow-pink transform -skew-x-6 tracking-wider border-8 border-ink-black bg-ink-black p-4 md:p-6 inline-block">
            <PhoneticText text="論語大作戰" />
            <span className="block text-xl md:text-3xl mt-2 text-white opacity-80 tracking-widest">ANALECTS SPLAT OPERATION</span>
          </h1>
          <div className="absolute -bottom-6 right-0 md:right-10 bg-splat-cyan text-ink-black font-display text-xl md:text-3xl px-4 py-2 border-4 border-ink-black transform rotate-3 brutal-shadow">
            <PhoneticText text="世界選擇" rtClassName="text-ink-black/60" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {worlds.map(worldNum => {
          const bookName = worldBooks.get(worldNum) || "未知篇章";
          const worldColors = ['bg-splat-pink', 'bg-splat-green', 'bg-splat-cyan', 'bg-splat-yellow', 'bg-splat-purple'];
          const colorClass = worldColors[(worldNum - 1) % worldColors.length];
          
          // Check if world is unlocked (at least one lesson in previous world completed)
          // Open all worlds
          const isUnlocked = true;

          return (
            <button
              key={worldNum}
              disabled={!isUnlocked}
              onClick={() => {
                setCurrentWorld(worldNum);
                setViewState('map');
              }}
              className={`group relative h-48 md:h-64 border-8 border-ink-black transition-all transform hover:-translate-y-2 ${
                isUnlocked ? `${colorClass} brutal-shadow cursor-pointer` : 'bg-gray-500 grayscale cursor-not-allowed'
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="font-display text-2xl md:text-4xl text-ink-black mb-2 opacity-50">WORLD {worldNum}</span>
                <h2 className="text-2xl md:text-4xl font-bold text-ink-black leading-tight drop-shadow-sm">
                  <PhoneticText text={bookName} rtClassName="text-ink-black/60" />
                </h2>
                {!isUnlocked && (
                  <div className="mt-4 bg-ink-black/20 p-2 rounded-full">
                    <Lock className="w-8 h-8 text-ink-black" />
                  </div>
                )}
              </div>
              
              {/* Decorative splat effect on hover */}
              {isUnlocked && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white border-4 border-ink-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-6 h-6 text-ink-black fill-current" />
                </div>
              )}
            </button>
          );
        })}
      </main>
      
      <footer className="max-w-6xl mx-auto mt-20 text-center text-white/50 font-display">
        <p>2026 ANALECTS SPLAT OPERATION-CONCEPT BY REX CHU</p>
      </footer>
    </div>
  );
}

export default App;
