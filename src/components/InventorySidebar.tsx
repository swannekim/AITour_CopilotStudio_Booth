'use client';
import { useGame } from '@/store/GameState';
import { BookOpen, Search, Key, FileText } from 'lucide-react';

export function InventorySidebar() {
  const { collectedHints, stage } = useGame();

  if (stage === 3) return null; // hide on ending

  // For visual demo, we assume exactly 3 total hints max per stage
  const maxHints = 3;
  
  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2 z-50 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
      <div className="text-center pb-2 border-b border-slate-700">
        <BookOpen className="mx-auto mb-1 text-yellow-500" size={24} />
        <span className="text-xs font-bold text-slate-300 tracking-widest block">비밀 수첩</span>
        <span className="text-xs text-slate-500 block">({collectedHints.length}/{maxHints})</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {Array.from({ length: maxHints }).map((_, idx) => {
          const hintFound = collectedHints.length > idx;
          return (
            <div 
              key={idx}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${hintFound ? 'bg-indigo-900/50 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border-slate-700 border-dashed'}`}
            >
              {hintFound ? (
                <span className="animate-in zoom-in duration-500">
                  {idx === 0 ? <Search className="text-indigo-400" /> : idx === 1 ? <Key className="text-indigo-400" /> : <FileText className="text-indigo-400" />}
                </span>
              ) : (
                <span className="text-slate-600 font-bold text-xl">?</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
