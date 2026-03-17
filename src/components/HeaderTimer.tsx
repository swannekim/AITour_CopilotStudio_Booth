'use client';
import { useGame } from '@/store/GameState';
import { Timer } from 'lucide-react';

export function HeaderTimer() {
  const { timeLeft, stage } = useGame();

  if (stage === 3) return null; // hide on ending

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-2 rounded-full border-2 bg-black/80 backdrop-blur-md transition-colors duration-500 shadow-lg ${isUrgent ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
      <Timer className={isUrgent ? 'animate-pulse' : ''} />
      <span className="text-2xl font-mono font-bold tracking-wider">
        {min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
