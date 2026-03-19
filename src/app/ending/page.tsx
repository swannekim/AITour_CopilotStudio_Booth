'use client';

import { useGame } from '@/store/GameState';
import { Mail, RotateCcw, ShieldCheck } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Ending() {
  const { stage, resetGame } = useGame();
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [isCertificateSent, setIsCertificateSent] = useState(false);

  useEffect(() => {
    if (stage !== 3) {
      router.replace(stage === 1 ? '/' : '/stage2');
      return;
    }

    const timer = setTimeout(() => {
      setShowSummary(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, [stage, router]);

  if (stage !== 3) return null;

  const handleRestart = () => {
    resetGame();
    router.push('/');
  };

  const handleCertificateSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.dispatchEvent(
      new CustomEvent('certificate-request', {
        detail: {
          name: playerName.trim(),
          mail: playerEmail.trim(),
        },
      })
    );
    setIsCertificateSent(true);
  };

  return (
    <main className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.22),_transparent_30%),linear-gradient(180deg,#04070c_0%,#02040a_100%)]" />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]" />

      {!showSummary ? (
        <div className="z-10 flex flex-col items-center justify-center animate-in zoom-in-75 fade-in duration-700">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_80px_rgba(56,189,248,0.22)]">
            <ShieldCheck size={76} className="text-cyan-200" />
          </div>
          <h1 className="mt-8 text-center text-6xl font-black tracking-[0.26em] text-white">
            CASE CLOSED
          </h1>
          <p className="mt-4 text-lg text-cyan-100/80">철문 해제 및 탐정 구출 완료</p>
        </div>
      ) : (
        <div className="z-10 w-full max-w-3xl rounded-[32px] border border-cyan-300/20 bg-[#0b1119]/85 p-10 text-center shadow-[0_0_100px_rgba(56,189,248,0.14)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-green-400/40 bg-green-400/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <span className="text-4xl font-black text-green-300">✓</span>
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-[0.12em] text-white">사건 해결</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            사라진 탐정의 사무실에서 단서를 모아 범인의 지하 창고까지 추적해냈습니다.
            <br />
            시공간 궤적과 소거법으로 범인의 아지트를 돌파했다! 탐정을 무사히 구출했다!
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-black/35 p-6 text-left">
            <div className="text-sm font-black tracking-[0.24em] text-cyan-300">CLEAR REWARD</div>
            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300/15">
                <Mail size={22} className="text-cyan-200" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">방탈출 Certificate 신청</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  방탈출 Certificate 발송을 원하시면 이메일을 입력해주세요.
                </p>
              </div>
            </div>

            <form onSubmit={handleCertificateSubmit} className="mt-5 flex flex-col gap-4">
              <input
                type="text"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="이름"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-300/60"
                required
              />
              <input
                type="email"
                value={playerEmail}
                onChange={(event) => setPlayerEmail(event.target.value)}
                placeholder="이메일"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-300/60"
                required
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-300 px-6 py-4 text-base font-black text-slate-950 transition-all hover:scale-[1.01] hover:bg-cyan-200"
              >
                Submit
              </button>
            </form>

            {isCertificateSent && (
              <div className="mt-4 rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm font-semibold text-green-200">
                탈출 증명서를 전송해드렸습니다.
              </div>
            )}
          </div>

          <button
            onClick={handleRestart}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-cyan-300 px-8 py-4 text-lg font-black text-slate-950 transition-all hover:scale-[1.02] hover:bg-cyan-200"
          >
            <RotateCcw size={22} />
            다시 플레이하기
          </button>
        </div>
      )}
    </main>
  );
}
