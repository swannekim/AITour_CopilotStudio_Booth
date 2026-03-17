'use client';

import { useGame } from '@/store/GameState';
import { HeaderTimer } from '@/components/HeaderTimer';
import { DialogBox } from '@/components/DialogBox';
import { InventorySidebar } from '@/components/InventorySidebar';
import { Tv, Radio, FileText, DoorClosed, Lock, Unlock } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Stage2() {
  const { stage, addHint, showDialog, collectedHints, goToStage } = useGame();
  const router = useRouter();
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [suspectName, setSuspectName] = useState('');
  const [cctvActive, setCctvActive] = useState<number[]>([]);

  // Handle stage routing mismatch
  useEffect(() => {
    if (stage === 1) {
      router.replace('/');
    } else if (stage === 3) {
      router.replace('/ending');
    }
  }, [stage, router]);

  if (stage !== 2) return null;

  const handleCCTV = (index: number) => {
    if (!cctvActive.includes(index)) {
      setCctvActive(prev => [...prev, index]);
    }
    
    const newActive = cctvActive.includes(index) ? cctvActive : [...cctvActive, index];
    
    if (newActive.length === 4) {
      addHint(1);
      showDialog({ speaker: '나', text: '4개의 CCTV 화면을 모두 확인했다. 범인은 검은 모자를 쓰고 다리를 절고 있었다.' });
    } else {
      showDialog({ speaker: '나', text: `CCTV ${index}번 화면을 확인 중... 아직 전체 경로는 모르겠다.` });
    }
  };

  const handleRadio = () => {
    addHint(2);
    showDialog({ speaker: '나', text: '음향 조작기를 틀었다. "지지직... 놈은 왼손잡이야... 조심해..." 탐정님의 음성이다!' });
  };

  const handleTornPage = () => {
    addHint(3);
    showDialog({ speaker: '나', text: '바닥에 떨어진 수첩 찢어진 페이지 조각. "용의자의 이니셜은 M.X 다."' });
  };

  const handleDoor = () => {
    if (collectedHints.length < 3) {
      showDialog({ speaker: '나', text: '굳게 잠긴 철문이다. 암호 패드에 [용의자 이름]을 입력해야 하는데 단서가 부족하다.' });
    } else {
      setShowDoorModal(true);
    }
  };

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const answer = suspectName.trim().toUpperCase();
    if (answer === 'M.X' || answer === 'MX' || answer === 'M X') {
      showDialog({ speaker: '시스템', text: '철문이 열렸습니다. 탐정님! 무사하셨군요!' });
      setShowDoorModal(false);
      setTimeout(() => {
        goToStage(3);
        router.push('/ending');
      }, 3000);
    } else {
      showDialog({ speaker: '시스템', text: '틀린 암호입니다. 경보가 울릴 수 있습니다.' });
      setSuspectName('');
    }
  };

  return (
    <main className="relative w-screen h-screen bg-[#0f0e17] flex items-center justify-center overflow-hidden font-sans">
      <HeaderTimer />
      <InventorySidebar />
      <DialogBox />

      {/* Background Room */}
      <div className="relative w-[1000px] h-[650px] bg-[#16161a] shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-3xl border-8 border-[#000000] p-8 flex flex-col items-center overflow-hidden">
        
        {/* Wall details */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent"></div>
        
        <h1 className="absolute top-8 left-12 text-4xl font-black text-[#2cb67d]/10 tracking-widest select-none pointer-events-none">
          BASEMENT B-402
        </h1>

        {/* CCTV Monitors on Wall */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 grid grid-cols-2 gap-4 bg-[#0f0e17] p-4 rounded-xl border-4 border-[#2e2f3e] shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => handleCCTV(num)}
              className="relative w-32 h-24 bg-black rounded border-2 border-[#7f5af0] overflow-hidden group transition-all"
            >
              <div className="absolute inset-0 bg-[#7f5af0]/10 group-hover:bg-[#7f5af0]/30 transition-colors z-10"></div>
              {cctvActive.includes(num) ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_2px,#fff_4px)]"></div>
                  <Tv className="text-[#2cb67d] animate-pulse" size={32} />
                  <span className="absolute top-1 left-2 text-[#2cb67d] text-xs font-mono font-bold">CAM 0{num}</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                  <span className="text-zinc-700 font-mono text-sm group-hover:text-zinc-500">NO SIGNAL</span>
                </div>
              )}
            </button>
          ))}
          {collectedHints.includes(1) && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-2 border-[#000000] flex items-center justify-center shadow-md animate-in zoom-in z-20">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Floor Area */}
        <div className="absolute bottom-0 w-[900px] h-[250px] bg-gradient-to-t from-[#0f0e17] to-[#16161a] border-t-2 border-[#2e2f3e] rounded-b-3xl flex items-end justify-center pb-8 relative shadow-inner">
          
          {/* Audio Recorder on Left Table */}
          <div className="absolute left-20 bottom-16 w-32 h-40 bg-zinc-900 border-t-2 border-r-2 border-zinc-700 shadow-2xl flex items-end justify-center pb-8">
            <button 
              onClick={handleRadio}
              className="group transition-transform hover:scale-110 hover:-translate-y-2 relative"
            >
              <Radio size={56} className="text-[#ff8906] drop-shadow-[0_0_15px_rgba(255,137,6,0.5)]" />
              {collectedHints.includes(2) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center shadow-md animate-in zoom-in">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
              <div className="absolute -bottom-6 w-full text-center text-[10px] text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                PLAY
              </div>
            </button>
          </div>

          {/* Locked Door in Center */}
          <button 
            onClick={handleDoor}
            className="group absolute bottom-12 left-1/2 -translate-x-1/2 transition-transform hover:scale-105"
          >
            <div className="w-48 h-72 bg-zinc-800 rounded-t-sm border-x-8 border-t-8 border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:border-[#7f5af0]">
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-4 bg-zinc-900"></div>
              <div className="absolute left-1/2 -translate-x-1/2 h-full w-4 bg-zinc-900"></div>
              
              <div className="w-16 h-24 bg-black border-4 border-zinc-700 rounded absolute z-20 flex flex-col items-center pt-2 shadow-[0_0_20px_rgba(255,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(127,90,240,0.5)] transition-shadow">
                <div className="w-8 h-3 bg-red-500 mb-2 animate-pulse"></div>
                {collectedHints.length === 3 ? (
                  <Unlock size={24} className="text-[#2cb67d]" />
                ) : (
                  <Lock size={24} className="text-zinc-500" />
                )}
                <div className="mt-auto mb-2 grid grid-cols-3 gap-1 px-2 w-full">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-zinc-800 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-64 h-4 bg-zinc-900 rounded-sm mx-auto shadow-2xl"></div>
          </button>

          {/* Torn Page on Right Floor */}
          <button 
            onClick={handleTornPage}
            className="absolute right-32 bottom-8 transition-transform hover:scale-125 hover:rotate-12 duration-300 group"
          >
            <div className="relative">
              <FileText size={36} className="text-slate-300 transform -rotate-12 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]" />
              {collectedHints.includes(3) && (
                <div className="absolute -top-4 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center shadow-md animate-in zoom-in">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Access Modal */}
      {showDoorModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#16161a] border-4 border-[#ff8906] rounded-xl p-10 w-[28rem] shadow-[0_0_100px_rgba(255,137,6,0.3)] relative transform transition-all duration-300 animate-in zoom-in-95">
            <button 
              onClick={() => setShowDoorModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors p-2"
            >
              ✕
            </button>
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-[#0f0e17] rounded-lg flex items-center justify-center border-4 border-[#2e2f3e] shadow-inner mb-2">
                <DoorClosed size={48} className="text-[#ff8906]" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest text-center">
                AUTHORIZATION REQUIRED<br/>
                <span className="text-sm font-normal text-[#94a1b2] tracking-normal">Enter suspect's initials/name</span>
              </h2>
              <form onSubmit={handleNameSubmit} className="flex flex-col w-full gap-5">
                <input 
                  type="text" 
                  value={suspectName}
                  onChange={(e) => setSuspectName(e.target.value)}
                  placeholder="NAME / INITIALS"
                  className="w-full bg-[#0f0e17] border-2 border-[#2e2f3e] rounded-lg px-4 py-4 text-3xl text-center font-mono font-bold tracking-[0.2em] text-[#fffffe] focus:outline-none focus:border-[#ff8906] transition-colors placeholder:text-[#2e2f3e]"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={suspectName.length < 2}
                  className="w-full bg-[#ff8906] hover:bg-[#ff9c2a] disabled:bg-[#2e2f3e] disabled:text-[#72757e] disabled:cursor-not-allowed text-[#0f0e17] font-black py-4 rounded-lg transition-all shadow-lg active:scale-95 text-lg tracking-widest mt-2"
                >
                  UNLOCK DOOR
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
