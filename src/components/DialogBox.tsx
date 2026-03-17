'use client';
import { useGame } from '@/store/GameState';
import { ChevronRight } from 'lucide-react';

export function DialogBox() {
  const { dialog, hideDialog } = useGame();

  if (!dialog) return null;

  return (
    <div 
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl z-50 cursor-pointer animate-in fade-in slide-in-from-bottom-5 duration-300"
      onClick={hideDialog}
    >
      <div className="bg-slate-900/90 border-2 border-slate-600 rounded-xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-sm relative">
        {dialog.speaker && (
          <div className="absolute -top-6 left-4 bg-indigo-600 text-white px-4 py-1 rounded-t-lg font-bold tracking-widest text-sm border-x-2 border-t-2 border-slate-600 shadow-md">
            {dialog.speaker}
          </div>
        )}
        <p className="text-xl text-slate-200 leading-relaxed font-semibold min-h-[3rem]">
          {dialog.text}
        </p>
        <div className="absolute bottom-4 right-4 animate-pulse">
          <ChevronRight className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}
