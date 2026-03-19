'use client';

import { useGame } from '@/store/GameState';
import { HeaderTimer } from '@/components/HeaderTimer';
import { DialogBox } from '@/components/DialogBox';
import { InventorySidebar } from '@/components/InventorySidebar';
import { DoorClosed, FileText, Lock, Radio, Tv, Unlock, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const CCTV_ORDER = ['B', 'C', 'A', 'D'] as const;

const CCTV_MONITORS = [
  {
    id: 'A',
    title: '엎질러진 커피',
    detail: '바닥에 커피와 발자국이 남아 있다',
    tone: 'from-amber-500/20 to-zinc-950',
  },
  {
    id: 'B',
    title: '커피를 들고 이동',
    detail: '아직 컵은 멀쩡하다',
    tone: 'from-emerald-500/20 to-zinc-950',
  },
  {
    id: 'C',
    title: '넘어지는 순간',
    detail: '왼손으로 벽을 짚으며 미끄러진다',
    tone: 'from-red-500/20 to-zinc-950',
  },
  {
    id: 'D',
    title: '누군가 닦고 있음',
    detail: '현장을 급히 지우고 있다',
    tone: 'from-cyan-500/20 to-zinc-950',
  },
] as const;

const SUSPECT_ROWS = [
  ['김성호', '180cm', '오른손', '목수', '흡연자'],
  ['강수진', '165cm', '왼손', '피아니스트', '고양이 알레르기'],
  ['구승민', '175cm', '왼손', '프로그래머', '고양이 집사'],
  ['권시아', '170cm', '오른손', '수영선수', '비흡연자'],
] as const;

const normalizeAnswer = (value: string) => value.replace(/\s+/g, '');

export default function Stage2() {
  const { stage, addHint, showDialog, collectedHints, goToStage } = useGame();
  const router = useRouter();
  const [showCctvModal, setShowCctvModal] = useState(false);
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [suspectName, setSuspectName] = useState('');
  const [cctvSequence, setCctvSequence] = useState<string[]>([]);
  const [cctvNextHint, setCctvNextHint] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (stage === 1) {
      router.replace('/');
    } else if (stage === 3) {
      router.replace('/ending');
    }
  }, [stage, router]);

  useEffect(() => {
    if (stage === 2) {
      const timer = setTimeout(() => {
        showDialog({
          speaker: '나',
          text: '탐정님이 범인의 아지트에 갇혀 있다. CCTV 시계열을 복원하고 K.S.의 정체를 밝혀 철문 잠금을 해제해야 한다.',
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [stage, showDialog]);

  useEffect(() => {
    return () => {
      audioCleanupRef.current?.();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (stage !== 2) return null;

  const isSynced = collectedHints.includes(1);
  const hasHandHint = collectedHints.includes(2);
  const hasNoiseHint = collectedHints.includes(3);

  const getGuideText = () => {
    if (collectedHints.length === 0) return '🔍 CCTV 화면의 순서를 먼저 맞춰 보자.';
    if (collectedHints.length === 1) return '🔍 화면 C를 다시 자세히 확인해 보자.';
    if (collectedHints.length === 2) return '🔍 음성 변조기 뒤에서 들리는 소음이 수상하다.';
    return '🚪 모든 단서를 모았다! 철문을 확인하자.';
  };

  const handleCctvConsole = () => {
    setShowCctvModal(true);
  };

  const stopVoicePlayback = () => {
    audioCleanupRef.current?.();
    audioCleanupRef.current = null;

    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }

    speechRef.current = null;
  };

  const playVoicePlayback = async () => {
    if (typeof window === 'undefined') return;

    stopVoicePlayback();

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = ctx;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const createdNodes: AudioNode[] = [];
    const createdTimers: number[] = [];
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.16, now);
    masterGain.connect(ctx.destination);
    createdNodes.push(masterGain);

    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(84, now);
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.0001, now);
    humGain.gain.exponentialRampToValueAtTime(0.045, now + 0.15);
    humGain.gain.exponentialRampToValueAtTime(0.02, now + 3.8);
    humOsc.connect(humGain);
    humGain.connect(masterGain);
    humOsc.start(now);
    humOsc.stop(now + 4);
    createdNodes.push(humOsc, humGain);

    const makeMeow = (startAt: number, pitch: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, startAt);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.52, startAt + 0.28);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.07, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.34);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startAt);
      osc.stop(startAt + 0.36);
      createdNodes.push(osc, gain);
    };

    makeMeow(now + 0.55, 620);
    makeMeow(now + 2.1, 540);

    const utterance = new SpeechSynthesisUtterance('탐정은 내가 이미 처리했다. 너도 곧 처리될 거야.');
    utterance.lang = 'ko-KR';
    utterance.rate = 0.82;
    utterance.pitch = 0.52;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    speechRef.current = utterance;
    createdTimers.push(
      window.setTimeout(() => {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }, 180)
    );

    audioCleanupRef.current = () => {
      createdTimers.forEach((timer) => window.clearTimeout(timer));
      createdNodes.forEach((node) => {
        try {
          node.disconnect();
        } catch {}
      });
    };
  };

  const handleCCTV = (sceneId: string) => {
    if (!isSynced) {
      const expectedScene = CCTV_ORDER[cctvSequence.length];

      if (sceneId !== expectedScene) {
        setCctvSequence([]);
        setCctvNextHint(expectedScene);
        showDialog({
          speaker: '나',
          text: '영상이 뒤죽박죽이네요. 엎질러진 커피를 닦기 전에는 반드시 쏟는 일이 먼저 있었겠죠? 시간의 흐름에 따라 화면을 순서대로 눌러보세요.',
        });
        return;
      }

      const nextSequence = [...cctvSequence, sceneId];
      setCctvSequence(nextSequence);
      setCctvNextHint(null);

      if (nextSequence.length === CCTV_ORDER.length) {
        addHint(1);
        showDialog({
          speaker: '시스템',
          text: '시스템 동기화 완료. 음성 변조기 아이템과 K.S 용의자 프로필이 활성화되었습니다.',
        });
        return;
      }

      showDialog({
        speaker: '나',
        text: `좋아, 순서가 맞다. (${nextSequence.length}/4) 다음 장면도 인과관계에 맞게 골라 보자.`,
      });
      return;
    }

    if (sceneId === 'C' && !hasHandHint) {
      addHint(2);
      showDialog({
        speaker: '나',
        text: '화면 C를 다시 보니, 범인은 넘어질 때 왼손으로 벽을 짚었다. 용의자 표와 대조하면 오른손잡이 둘은 제외할 수 있겠다.',
      });
      return;
    }

    if (sceneId === 'C') {
      showDialog({
        speaker: '나',
        text: '확실하다. 범인은 넘어질 때 왼손으로 벽을 짚었다. 오른손잡이 용의자 둘은 제외할 수 있다.',
      });
      return;
    }

    showDialog({
      speaker: '나',
      text: `${sceneId} 화면은 이미 확인했다. 핵심은 화면 C의 손 방향과 이후 들리는 배경 소음이다.`,
    });
  };

  const handleRadio = () => {
    if (!isSynced) {
      showDialog({
        speaker: '나',
        text: '음성 변조기는 아직 잠겨 있다. 먼저 CCTV 시계열을 맞춰 시스템을 동기화해야 한다.',
      });
      return;
    }

    if (!hasHandHint) {
      showDialog({
        speaker: '나',
        text: '지금은 손 단서가 먼저다. CCTV 화면 C를 다시 자세히 보고 범인의 주 사용 손부터 확인하자.',
      });
      return;
    }

    if (!hasNoiseHint) {
      addHint(3);
      void playVoicePlayback();
      showDialog({
        speaker: '나',
        text: '목소리가 심하게 변조되었지만, 뒤에서 희미한 고양이 울음이 섞여 들린다. 고양이 알레르기인 용의자는 제외할 수 있겠다.',
      });
      return;
    }

    void playVoicePlayback();
    showDialog({
      speaker: '나',
      text: '변조 음성 뒤에 희미한 고양이 울음이 반복된다. 고양이와 관련 없는 용의자는 마지막으로 소거할 수 있다.',
    });
  };

  const handleProfile = () => {
    if (!isSynced) {
      showDialog({
        speaker: '나',
        text: '용의자 프로필은 비활성화되어 있다. CCTV 시계열을 먼저 복원하자.',
      });
      return;
    }

    setShowProfileModal(true);

    if (!hasHandHint) {
      showDialog({
        speaker: '나',
        text: '수첩 메모의 이니셜은 K.S다. 프로필 표는 열렸지만, 먼저 화면 C의 손 단서를 확보해야 한다.',
      });
      return;
    }

    if (!hasNoiseHint) {
      showDialog({
        speaker: '나',
        text: 'K.S이면서 왼손잡이인 후보는 둘이다. 이제 음성 변조기 뒤의 배경 소음만 확인하면 된다.',
      });
      return;
    }

    showDialog({
      speaker: '나',
      text: '왼손잡이이면서 K.S이고, 고양이와 관련된 특징까지 맞는 사람은 한 명뿐이다.',
    });
  };

  const handleDoor = () => {
    if (!isSynced) {
      showDialog({
        speaker: '나',
        text: '굳게 잠긴 철문이다. 먼저 CCTV 시계열을 맞춰 시스템 동기화부터 끝내자.',
      });
      return;
    }

    if (!hasHandHint) {
      showDialog({
        speaker: '나',
        text: '아직 단서가 부족하다. CCTV 화면 C를 다시 보고 범인의 주 사용 손을 확인하자.',
      });
      return;
    }

    if (!hasNoiseHint) {
      showDialog({
        speaker: '나',
        text: '한 명으로 좁히려면 마지막 단서가 더 필요하다. 음성 변조기 뒤의 배경 소음을 들어보자.',
      });
      return;
    }

    setShowDoorModal(true);
  };

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const answer = normalizeAnswer(suspectName);

    if (answer === '구승민') {
      showDialog({
        speaker: '시스템',
        text: '잠금 장치 해제. 탐정 구출 성공. Forms 양식 연동을 완료하고 Certificate 이메일 발송을 시작합니다.',
      });
      setShowDoorModal(false);
      setTimeout(() => {
        goToStage(3);
        router.push('/ending');
      }, 3000);
    } else {
      showDialog({
        speaker: '시스템',
        text: '틀린 암호입니다. K.S 이니셜, 왼손 단서, 배경 소음을 다시 대조해 보세요.',
      });
      setSuspectName('');
    }
  };

  return (
    <main className="relative w-full h-full bg-[#0b0d13] flex items-center justify-center overflow-hidden font-sans">
      <HeaderTimer />
      <InventorySidebar />
      <DialogBox />

      <div className="stage-banner absolute top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1">
        <div className="bg-black/70 backdrop-blur-md border border-red-500/40 rounded-xl px-6 py-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <span className="text-red-400 font-black text-sm tracking-[0.3em] uppercase">Stage 2</span>
          <span className="text-slate-400 mx-3">|</span>
          <span className="text-slate-300 font-semibold text-sm">범인의 아지트, 최후의 추리</span>
        </div>
      </div>

      <div className="guide-text absolute bottom-24 left-1/2 -translate-x-1/2 z-40" key={collectedHints.length}>
        <div className="bg-black/60 backdrop-blur-sm border border-slate-600/40 rounded-lg px-5 py-2 shadow-lg">
          <span className="text-slate-300 text-sm font-medium">{getGuideText()}</span>
        </div>
      </div>

      <div className="relative w-[1000px] h-[620px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-4 border-[#23252c]">
        <div className="absolute top-0 left-0 w-full h-[12px] bg-gradient-to-b from-[#545b65] to-[#343942] z-10" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a1e26_0%,#161922_55%,#1d1713_55%,#120f0d_100%)]">
          <div className="absolute top-0 left-[12%] w-[30%] h-[60%] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <div className="absolute top-[60px] right-[70px] w-[180px] h-[100px] bg-red-500/10 blur-3xl pointer-events-none" />
        </div>

        <div className="absolute bottom-[180px] left-0 w-full h-[14px] bg-gradient-to-b from-[#3d332c] to-[#261f1a] z-20 shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        <div className="absolute bottom-0 left-0 w-full h-[180px] z-10 bg-[repeating-linear-gradient(90deg,#32251d_0px,#32251d_56px,#2a1f18_56px,#2a1f18_112px)]" />

        <div className="absolute top-[28px] right-[82px] z-20 pointer-events-none">
          <div className="w-[10px] h-[18px] bg-[#2a2a2a] rounded-b-sm mx-auto" />
          <div className="w-[32px] h-[22px] rounded-md bg-[#202229] shadow-md flex items-center justify-center">
            <div className="w-[10px] h-[10px] rounded-full bg-black border border-[#444]">
              <div className="w-[3px] h-[3px] rounded-full bg-red-500 mx-auto mt-[3px] animate-pulse" />
            </div>
          </div>
        </div>

        <button
          onClick={handleCctvConsole}
          type="button"
          className="absolute top-[84px] left-[300px] z-30 group transition-transform hover:scale-[1.03]"
        >
          <div className="relative rounded-2xl border border-slate-700/70 bg-black/55 p-4 shadow-[0_0_30px_rgba(0,0,0,0.65)]">
            <div className="grid grid-cols-2 gap-3">
              {CCTV_MONITORS.map((monitor) => (
                <div
                  key={monitor.id}
                  className="relative w-[124px] h-[82px] rounded-xl border border-[#4c4f67] overflow-hidden bg-black"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${monitor.tone}`} />
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.08)_3px,rgba(255,255,255,0.08)_6px)]" />
                  <div className="absolute top-2 left-2 text-[10px] font-black tracking-[0.16em] text-emerald-300">CAM {monitor.id}</div>
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <Tv size={20} className="text-emerald-300/90" />
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute inset-0 rounded-2xl bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors" />

            {isSynced && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-2 border-black flex items-center justify-center shadow-md animate-in zoom-in">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            )}
          </div>
        </button>

        <div className="absolute top-[96px] right-[120px] w-[170px] h-[300px] z-20 rounded-t-xl bg-[linear-gradient(90deg,#30343c_0%,#434954_20%,#31353d_50%,#454c57_80%,#2f333b_100%)] border-x-[8px] border-t-[8px] border-[#1f2228] shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-[14px] rounded-t-lg border border-white/10" />
          <div className="absolute left-1/2 -translate-x-1/2 top-[22px] rounded-lg border border-amber-600/50 bg-[#2c2017] px-4 py-2 text-center shadow-lg">
            <div className="text-[10px] font-black tracking-[0.25em] text-amber-300">MEMO</div>
            <div className="mt-1 text-lg font-black tracking-[0.28em] text-amber-100">K.S</div>
          </div>
          <div className="absolute right-[20px] top-1/2 -translate-y-1/2 w-[10px] h-[52px] rounded-full bg-gradient-to-b from-slate-200 to-slate-500" />
          <button
            onClick={handleDoor}
            type="button"
            className="absolute left-1/2 -translate-x-1/2 top-[150px] z-20"
          >
            <div className="w-16 h-24 bg-black border-4 border-zinc-700 rounded flex flex-col items-center pt-2 shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-transform hover:scale-105">
              <div className="w-8 h-3 bg-red-500 mb-2 animate-pulse" />
              {hasNoiseHint ? (
                <Unlock size={22} className="text-[#2cb67d]" />
              ) : (
                <Lock size={22} className="text-zinc-500" />
              )}
              <div className="mt-auto mb-2 grid grid-cols-3 gap-1 px-2 w-full">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="w-2 h-2 bg-zinc-800 rounded-full" />
                ))}
              </div>
            </div>
          </button>
        </div>

        <div className="absolute bottom-[180px] left-[90px] z-20">
          <div className="w-[150px] h-[105px] bg-gradient-to-b from-[#262a31] to-[#1a1d22] rounded-t-xl border border-zinc-700 shadow-xl" />
          <button
            onClick={handleRadio}
            type="button"
            className="absolute left-1/2 top-[18px] -translate-x-1/2 group transition-transform hover:scale-110 hover:-translate-y-1"
          >
            <Radio size={54} className={isSynced ? 'text-[#ff8906] drop-shadow-[0_0_15px_rgba(255,137,6,0.45)]' : 'text-zinc-600'} />
            {hasNoiseHint && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center shadow-md animate-in zoom-in">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
            <div className="absolute -bottom-6 w-full text-center text-[10px] text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {isSynced ? 'PLAY' : 'LOCKED'}
            </div>
          </button>
        </div>

        <div className="absolute bottom-[188px] left-[300px] z-20 pointer-events-none">
          <div className="w-[180px] h-[22px] bg-[#49382d] rounded-t-md shadow-[0_4px_8px_rgba(0,0,0,0.35)]" />
          <div className="w-[180px] h-[84px] bg-gradient-to-b from-[#60493b] to-[#4d3b30] rounded-b-md" />
        </div>

        <button
          onClick={handleProfile}
          type="button"
          className="absolute bottom-[206px] left-[350px] z-30 group transition-transform hover:scale-105 hover:-translate-y-1"
        >
          <div className="relative w-[110px] h-[82px] rounded-md border border-slate-300 bg-slate-100 shadow-[0_8px_16px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[20px] bg-slate-300 border-b border-slate-400 flex items-center justify-center">
              <span className="text-[9px] font-black tracking-[0.22em] text-slate-700">K.S FILE</span>
            </div>
            <div className="absolute top-[28px] left-[12px] right-[12px] space-y-[6px]">
              <div className="h-[4px] rounded bg-slate-400/80" />
              <div className="h-[4px] rounded bg-slate-400/55" />
              <div className="h-[4px] w-4/5 rounded bg-slate-400/70" />
            </div>
            <FileText size={20} className={`absolute bottom-3 right-3 ${isSynced ? 'text-slate-700' : 'text-slate-400'}`} />
          </div>
          {isSynced && (
            <div className="absolute -top-2 -left-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-[2px] text-[9px] font-black text-cyan-800">
              OPEN
            </div>
          )}
        </button>

        <div className="absolute bottom-[180px] right-[24px] w-[70px] h-[76px] rounded-tl-2xl bg-gradient-to-b from-[#34494d] to-[#24363a] z-20 pointer-events-none" />
        <div className="absolute bottom-[180px] left-[520px] w-[110px] h-[14px] bg-black/20 rounded-full blur-md z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15 pointer-events-none z-[35]" />
      </div>

      {showCctvModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#11151c] border-2 border-[#7f5af0]/50 rounded-2xl p-8 w-[min(54rem,calc(100%-4rem))] shadow-[0_0_80px_rgba(127,90,240,0.16)] relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowCctvModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2"
              type="button"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <div className="text-xs text-[#7f5af0] font-black tracking-[0.28em]">CCTV ARCHIVE</div>
              <h2 className="text-2xl font-black text-white mt-2">시공간 궤적 복원</h2>
              <p className="mt-2 text-sm text-slate-400">사건의 인과관계에 맞게 4개의 장면을 순서대로 클릭하세요.</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {CCTV_MONITORS.map((monitor) => (
                <button
                  key={monitor.id}
                  onClick={() => handleCCTV(monitor.id)}
                  type="button"
                  className={`relative w-full h-[210px] rounded-2xl border-2 overflow-hidden transition-transform hover:scale-[1.02] ${
                    cctvSequence.includes(monitor.id)
                      ? 'border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.22)]'
                      : 'border-[#4c4f67] hover:border-[#7f5af0]'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${monitor.tone}`} />
                  <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.08)_3px,rgba(255,255,255,0.08)_6px)]" />
                  <div className="absolute top-3 left-4 text-xs font-black tracking-[0.18em] text-emerald-300 z-20">CAM {monitor.id}</div>
                  {!isSynced && cctvNextHint === monitor.id && (
                    <div className="absolute top-3 right-3 rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-100 z-20">
                      NEXT
                    </div>
                  )}

                  <div className="relative z-10 h-full">
                    {monitor.id === 'A' && (
                      <>
                        <div className="absolute bottom-10 left-8 w-24 h-10 rounded-full bg-[#4a2b18]/70 blur-sm" />
                        <div className="absolute bottom-9 left-10 w-20 h-8 rounded-[50%] border border-amber-200/20 bg-amber-700/30" />
                        <div className="absolute bottom-7 right-10 flex gap-2">
                          <div className="w-5 h-10 rounded-full bg-black/55 rotate-[20deg]" />
                          <div className="w-5 h-10 rounded-full bg-black/45 rotate-[12deg]" />
                          <div className="w-5 h-10 rounded-full bg-black/35 rotate-[4deg]" />
                        </div>
                      </>
                    )}
                    {monitor.id === 'B' && (
                      <>
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-16 h-28 rounded-t-[24px] rounded-b-md bg-black/40" />
                        <div className="absolute bottom-[86px] left-[58%] w-7 h-7 rounded-b-md border-2 border-stone-200/70 bg-stone-100/80" />
                        <div className="absolute bottom-[94px] left-[67%] w-3 h-4 rounded-r-full border-2 border-stone-200/70 border-l-0" />
                      </>
                    )}
                    {monitor.id === 'C' && (
                      <>
                        <div className="absolute left-[58px] top-[48px] w-2 h-96 bg-slate-200/30" />
                        <div className="absolute bottom-6 left-[96px] w-16 h-24 rounded-t-[24px] rounded-b-md bg-black/45 rotate-[20deg]" />
                        <div className="absolute bottom-[72px] left-[138px] w-7 h-7 rounded-b-md border-2 border-stone-200/70 bg-stone-100/80 rotate-[8deg]" />
                        <div className="absolute bottom-[102px] left-[86px] w-10 h-3 rounded-full bg-black/45 rotate-[-32deg]" />
                        <div className="absolute bottom-[96px] left-[56px] w-16 h-3 rounded-full bg-rose-200/55 rotate-[-12deg]" />
                      </>
                    )}
                    {monitor.id === 'D' && (
                      <>
                        <div className="absolute bottom-8 left-9 w-20 h-8 rounded-[50%] bg-amber-700/25" />
                        <div className="absolute bottom-14 right-[62px] w-12 h-14 rounded-t-[18px] rounded-b-md bg-black/45" />
                        <div className="absolute bottom-[76px] right-[38px] w-16 h-4 rounded-full bg-slate-100/65 rotate-[20deg]" />
                      </>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-black/70 border-t border-white/10 px-4 py-3 text-left">
                      <div className="text-sm font-bold text-white">{monitor.title}</div>
                      <div className="mt-1 text-xs text-slate-300">{monitor.detail}</div>
                    </div>
                  </div>

                  {monitor.id === 'C' && hasHandHint && (
                    <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center z-20">
                      ✓
                    </div>
                  )}
                  {cctvSequence.includes(monitor.id) && !isSynced && (
                    <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center z-20">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-700/60 bg-black/40 px-4 py-3 text-sm text-slate-300">
              {!isSynced
                ? '커피를 들고 이동한 뒤 넘어지고, 그 다음 엎질러진 현장이 남고, 마지막으로 누군가 닦는다.'
                : '시스템 동기화가 완료되었습니다. 이제 화면 C와 음성 단서를 확인하세요.'}
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#16161a] border-2 border-cyan-400/40 rounded-2xl p-8 w-[min(52rem,calc(100%-4rem))] shadow-[0_0_80px_rgba(34,211,238,0.18)] relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2"
              type="button"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <div className="text-xs text-cyan-300 font-black tracking-[0.28em]">K.S SUSPECT PROFILE</div>
              <h2 className="text-2xl font-black text-white mt-2">용의자 소거법 프로필</h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-700">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0f0e17] text-slate-400 text-xs uppercase tracking-[0.18em]">
                  <tr>
                    <th className="px-4 py-4">용의자 (K.S)</th>
                    <th className="px-4 py-4">키</th>
                    <th className="px-4 py-4">주 사용 손</th>
                    <th className="px-4 py-4">직업</th>
                    <th className="px-4 py-4">특이사항</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900/90 text-slate-200 text-sm">
                  {SUSPECT_ROWS.map((row, index) => (
                    <tr key={row[0]} className={index % 2 === 0 ? 'bg-white/[0.03]' : ''}>
                      <td className="px-4 py-4 font-bold">{row[0]}</td>
                      <td className="px-4 py-4">{row[1]}</td>
                      <td className="px-4 py-4">{row[2]}</td>
                      <td className="px-4 py-4">{row[3]}</td>
                      <td className="px-4 py-4">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showDoorModal && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#16161a] border-4 border-[#ff8906] rounded-xl p-10 w-[min(28rem,calc(100%-4rem))] shadow-[0_0_100px_rgba(255,137,6,0.3)] relative transform transition-all duration-300 animate-in zoom-in-95">
            <button
              onClick={() => setShowDoorModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors p-2"
              type="button"
            >
              ✕
            </button>
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-[#0f0e17] rounded-lg flex items-center justify-center border-4 border-[#2e2f3e] shadow-inner mb-2">
                <DoorClosed size={48} className="text-[#ff8906]" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest text-center">
                AUTHORIZATION REQUIRED
                <br />
                <span className="text-sm font-normal text-[#94a1b2] tracking-normal">Enter suspect&apos;s name</span>
              </h2>
              <form onSubmit={handleNameSubmit} className="flex flex-col w-full gap-5">
                <input
                  type="text"
                  value={suspectName}
                  onChange={(e) => setSuspectName(e.target.value)}
                  placeholder="용의자 이름 입력"
                  className="w-full bg-[#0f0e17] border-2 border-[#2e2f3e] rounded-lg px-4 py-4 text-3xl text-center font-bold text-[#fffffe] focus:outline-none focus:border-[#ff8906] transition-colors placeholder:text-[#2e2f3e]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={suspectName.trim().length < 2}
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
