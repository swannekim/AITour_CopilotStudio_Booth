'use client';

import { useGame } from '@/store/GameState';
import { HeaderTimer } from '@/components/HeaderTimer';
import { DialogBox } from '@/components/DialogBox';
import { InventorySidebar } from '@/components/InventorySidebar';
import { Calendar, Monitor, Coffee, CreditCard, Lock } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Stage1() {
  const { stage, addHint, showDialog, collectedHints, goToStage } = useGame();
  const router = useRouter();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showLaptopModal, setShowLaptopModal] = useState(false);
  const [password, setPassword] = useState('');

  // Handle stage routing mismatch
  useEffect(() => {
    if (stage === 2) {
      router.replace('/stage2');
    } else if (stage === 3) {
      router.replace('/ending');
    }
  }, [stage, router]);

  if (stage !== 1) return null;

  const handleCalendar = () => {
    addHint(1);
    showDialog({ speaker: '나', text: '달력에 이번 달 15일에 빨간 동그라미가 쳐져 있다. 중요한 날인가?' });
  };

  const handleCard = () => {
    setIsCardFlipped(true);
    addHint(2);
    showDialog({ speaker: '나', text: '명함 뒤에 4자리 숫자 [7392]가 적혀 있다.' });
  };

  const handleCoffee = () => {
    addHint(3);
    showDialog({ speaker: '나', text: '마시다 만 커피잔 밑에 메모지 조각이 있다. "비밀번호는 [달력 날짜] + [명함 숫자]"' });
  };

  const handleLaptop = () => {
    if (collectedHints.length < 3) {
      showDialog({ speaker: '나', text: '노트북에 잠금이 걸려 있다. 주변에서 단서를 더 모아야겠다.' });
    } else {
      setShowLaptopModal(true);
    }
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === '157392') {
      showDialog({ speaker: '시스템', text: '비밀번호 일치. 마지막 검색 기록: "지하 창고 B동 402호"... 탐정님이 위험해, 서둘러야겠다!' });
      setShowLaptopModal(false);
      setTimeout(() => {
        goToStage(2);
      }, 4000);
    } else {
      showDialog({ speaker: '시스템', text: '비밀번호가 틀렸습니다.' });
      setPassword('');
    }
  };

  return (
    <main className="relative w-screen h-screen bg-[#1a1b26] flex items-center justify-center overflow-hidden font-sans">
      <HeaderTimer />
      <InventorySidebar />
      <DialogBox />

      {/* Background Room */}
      <div className="relative w-[1000px] h-[650px] bg-[#24283b] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl border-8 border-[#16161e] p-8 flex flex-col items-center overflow-hidden">
        
        {/* Wall details */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white flex-shrink-0 to-transparent"></div>
        
        <h1 className="absolute top-8 left-12 text-5xl font-black text-slate-500/20 tracking-tighter select-none pointer-events-none">
          DETECTIVE K.
        </h1>

        {/* Calendar on Wall */}
        <button 
          onClick={handleCalendar}
          className="absolute top-20 right-32 p-5 bg-[#e0af68]/10 hover:bg-[#e0af68]/20 border-2 border-[#e0af68]/30 rounded-xl shadow-[0_0_20px_rgba(224,175,104,0.1)] hover:shadow-[0_0_25px_rgba(224,175,104,0.4)] transition-all duration-300 hover:scale-105 group"
        >
          <Calendar size={64} className="text-[#e0af68] group-hover:animate-pulse" />
          {collectedHints.includes(1) && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-2 border-[#24283b] flex items-center justify-center shadow-md animate-in zoom-in">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
        </button>

        {/* Desk Area */}
        <div className="absolute bottom-0 w-[850px] h-[350px] bg-[#414868] rounded-t-3xl border-t-8 border-[#1f2335] shadow-[0_-20px_50px_rgba(0,0,0,0.6)] flex items-end justify-center pb-12 relative">
          
          {/* Desk Surface Details */}
          <div className="absolute top-0 w-full h-8 bg-[#565f89] rounded-t-2xl opacity-50"></div>

          {/* Laptop */}
          <button 
            onClick={handleLaptop}
            className="group absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center transition-transform hover:scale-[1.02] z-20"
          >
            <div className="w-56 h-36 bg-[#1a1b26] rounded-t-xl border-4 border-[#16161e] shadow-2xl flex items-center justify-center relative overflow-hidden group-hover:shadow-[0_0_40px_rgba(122,162,247,0.4)] transition-shadow">
              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-400/20 transition-colors"></div>
              {collectedHints.length === 3 ? (
                <Lock size={48} className="text-green-400 animate-pulse" />
              ) : (
                <Monitor size={48} className="text-[#7aa2f7]" />
              )}
            </div>
            <div className="w-72 h-4 bg-[#7dcfff] rounded-b-xl border-x-4 border-b-4 border-[#16161e]"></div>
          </button>

          {/* Coffee Mug */}
          <button 
            onClick={handleCoffee}
            className="absolute left-24 bottom-24 p-4 transition-transform hover:scale-110 hover:-translate-y-4 hover:-rotate-12 duration-300 group"
          >
            <div className="relative pointer-events-none">
              <Coffee size={56} className="text-[#c0caf5] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
              <div className="absolute -top-6 left-6 w-2 h-8 bg-white/20 blur-sm animate-[pulse_2s_ease-in-out_infinite] rounded-full transform rotate-12"></div>
              {collectedHints.includes(3) && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-[#414868] flex items-center justify-center shadow-md animate-in zoom-in">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}
            </div>
          </button>

          {/* Business Card (3D Flip) */}
          <button 
            onClick={handleCard}
            className="absolute right-32 bottom-20 [perspective:1000px] group"
          >
            <div className={`w-32 h-20 transition-all duration-700 [transform-style:preserve-3d] ${isCardFlipped ? '[transform:rotateY(180deg)] scale-110' : 'hover:-translate-y-2'}`}>
              
              {/* Front of card */}
              <div className="absolute inset-0 bg-[#e0af68] border-2 border-[#cfc9c2] rounded-md shadow-xl flex items-center justify-center [backface-visibility:hidden]">
                <div className="text-center">
                  <CreditCard className="mx-auto text-amber-900 mb-1" size={24} />
                  <div className="w-16 h-1 bg-amber-900/40 rounded-full mx-auto"></div>
                </div>
              </div>
              
              {/* Back of card */}
              <div className="absolute inset-0 bg-indigo-100 border-2 border-indigo-300 rounded-md shadow-[0_0_30px_rgba(165,180,252,0.6)] flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="font-mono font-black text-2xl text-indigo-900 tracking-[0.2em] [transform:scaleX(-1)] pointer-events-none">
                  {/* The rotateY(180deg) makes text backwards, so we flip it back with scaleX(-1) */}
                </span>
                <div className="flex w-full h-full items-center justify-center bg-indigo-100 border-2 border-indigo-300 rounded-md">
                   <span className="font-mono font-black text-2xl text-indigo-900 tracking-[0.2em]">7392</span>
                </div>
              </div>

               {!isCardFlipped && collectedHints.includes(2) && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-2 border-[#cfc9c2] flex items-center justify-center shadow-md animate-in zoom-in z-50">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
            </div>
            
            {!isCardFlipped && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#c0caf5]/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Click to flip
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showLaptopModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#1a1b26] border-2 border-[#7aa2f7] rounded-3xl p-10 w-[26rem] shadow-[0_0_80px_rgba(122,162,247,0.3)] relative transform transition-all duration-300 animate-in zoom-in-95">
            <button 
              onClick={() => setShowLaptopModal(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors p-2"
            >
              ✕
            </button>
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-[#24283b] rounded-full flex items-center justify-center border-4 border-[#16161e] shadow-inner mb-2">
                <Lock size={36} className="text-[#7dcfff]" />
              </div>
              <h2 className="text-2xl font-black text-[#c0caf5] tracking-widest">SYSTEM LOCK</h2>
              <form onSubmit={handlePasswordSubmit} className="flex flex-col w-full gap-5">
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))} // only numbers
                  placeholder="CODE"
                  maxLength={6}
                  className="w-full bg-[#16161e] border-2 border-[#414868] rounded-xl px-4 py-4 text-3xl text-center font-mono font-bold tracking-[0.4em] text-[#e0af68] focus:outline-none focus:border-[#7aa2f7] transition-colors placeholder:text-[#414868]"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={password.length !== 6}
                  className="w-full bg-[#7aa2f7] hover:bg-[#8db4ff] disabled:bg-[#414868] disabled:text-[#565f89] disabled:cursor-not-allowed text-[#16161e] font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg tracking-widest mt-2"
                >
                  ACCESS
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
