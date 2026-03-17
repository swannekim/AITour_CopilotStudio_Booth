'use client';

import { useGame } from '@/store/GameState';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Ending() {
  const { stage, resetGame } = useGame();
  const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (stage !== 3) {
      router.replace(stage === 1 ? '/' : '/stage2');
    }
    
    // Play handcuffs animation for 2.5 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [stage, router]);

  if (stage !== 3) return null;

  const handleRestart = () => {
    resetGame();
    router.push('/');
  };

  return (
    <main className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#000000_100%)]"></div>
      
      {showAnimation ? (
        <div className="flex flex-col items-center justify-center z-10 animate-in spin-in-12 zoom-in-50 duration-1000">
          <ShieldAlert size={140} className="text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.9)]" />
          <h1 className="mt-8 text-6xl font-black text-white tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] animate-pulse">
            ARRESTED
          </h1>
        </div>
      ) : (
        <div className="z-10 bg-[#0f0e17]/80 backdrop-blur-lg border-2 border-[#7fc4fd] rounded-3xl p-12 max-w-2xl w-full flex flex-col items-center text-center shadow-[0_0_80px_rgba(127,196,253,0.3)] animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <span className="text-4xl text-green-400 font-bold">✓</span>
          </div>
          
          <h1 className="text-5xl font-black text-white mb-4 tracking-widest drop-shadow-md">
            사건 해결!
          </h1>
          <h2 className="text-2xl font-bold text-[#7fc4fd] mb-8">
            "범인은 당신이야!"
          </h2>
          
          <div className="bg-black/50 rounded-xl p-8 mb-10 border border-white/10 w-full text-left shadow-inner">
            <p className="text-slate-300 leading-relaxed mb-6 text-lg">
              위기에 빠진 K 탐정님을 무사히 구출했습니다.<br/>
              사무실에 남겨진 단서를 모아 범인의 아지트를 찾아냈고,<br/>
              완벽한 추리로 굳게 잠긴 철문을 열어냈습니다.
            </p>
            <p className="text-white font-bold text-xl drop-shadow">
              당신의 뛰어난 관찰력과 추리력 덕분입니다!
            </p>
          </div>
          
          <button 
            onClick={handleRestart}
            className="flex items-center gap-3 bg-[#7fc4fd] hover:bg-[#a1d5ff] text-black font-black px-10 py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(127,196,253,0.4)] hover:shadow-[0_0_50px_rgba(161,213,255,0.7)] hover:scale-105 active:scale-95 text-xl tracking-widest"
          >
            <RotateCcw size={28} />
            다시 플레이하기
          </button>
        </div>
      )}
    </main>
  );
}
