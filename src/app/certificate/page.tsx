'use client';

import { Download, ExternalLink, Printer } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const COPILOT_STUDIO_LINK = 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/';

const formatKstTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '시간 정보 없음';

  return `${new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)} (UTC+9, 한국시간 기준)`;
};

const buildCertificateHtml = (name: string, clearedAtLabel: string) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name} Certificate</title>
    <style>
      body {
        margin: 0;
        padding: 32px;
        font-family: Arial, Helvetica, sans-serif;
        background: #07111c;
        color: #e5eef7;
      }
      .card {
        max-width: 760px;
        margin: 0 auto;
        border-radius: 28px;
        border: 1px solid rgba(125, 211, 252, 0.24);
        background: linear-gradient(180deg, rgba(11, 17, 25, 0.98), rgba(9, 14, 22, 0.96));
        padding: 40px;
        box-shadow: 0 0 50px rgba(56, 189, 248, 0.12);
      }
      .eyebrow {
        color: #7dd3fc;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.18em;
      }
      h1 {
        margin: 18px 0 10px;
        font-size: 30px;
        color: white;
      }
      .lead {
        font-size: 18px;
        line-height: 1.7;
        color: #dbeafe;
      }
      .time {
        margin-top: 20px;
        color: #cbd5e1;
      }
      .link {
        margin-top: 28px;
        padding: 18px 20px;
        border-radius: 18px;
        background: rgba(125, 211, 252, 0.08);
        border: 1px solid rgba(125, 211, 252, 0.18);
      }
      a {
        color: #7dd3fc;
        word-break: break-all;
      }
      .footer {
        margin-top: 30px;
        font-weight: 700;
        color: white;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="eyebrow">AI TOUR ESCAPE CERTIFICATE</div>
      <h1>🎉 ${name}님 축하드립니다!</h1>
      <p class="lead">AI Business Solutions: Copilot Studio 부스의 방탈출 게임을 통과하셨습니다.</p>
      <p class="time">${clearedAtLabel}</p>
      <div class="link">
        <div>아래 링크에서 Copilot Studio에 대해 더 알아보세요!</div>
        <p><a href="${COPILOT_STUDIO_LINK}">${COPILOT_STUDIO_LINK}</a></p>
      </div>
      <div class="footer">Microsoft AI Tour in Seoul 2026</div>
    </main>
  </body>
</html>`;

export default function CertificatePage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name')?.trim() || '';
  const clearedAt = searchParams.get('clearedAt') || '';
  const clearedAtLabel = useMemo(() => formatKstTimestamp(clearedAt), [clearedAt]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!name) return;

    const html = buildCertificateHtml(name, clearedAtLabel);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `AI-Tour-Certificate-${name}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!name) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111c] px-4 py-8 text-white sm:px-6">
        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0b1119] p-6 text-center sm:p-8">
          <h1 className="text-3xl font-black">수료증 정보를 찾을 수 없습니다.</h1>
          <p className="mt-4 text-slate-300">
            엔딩 화면에서 이름을 입력해 수료증 링크를 다시 생성해주세요.
          </p>
          <Link
            href="/ending"
            className="mt-6 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950"
          >
            엔딩으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(180deg,#07111c_0%,#04070c_100%)] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl rounded-[32px] border border-cyan-300/20 bg-[#0b1119]/95 p-5 shadow-[0_0_80px_rgba(56,189,248,0.12)] sm:p-8">
        <div className="text-sm font-black tracking-[0.24em] text-cyan-300">AI TOUR ESCAPE CERTIFICATE</div>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">🎉 {name}님 축하드립니다!</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-200">
          AI Business Solutions: Copilot Studio 부스의 방탈출 게임을 통과하셨습니다.
        </p>
        <p className="mt-4 text-base text-slate-300">{clearedAtLabel}</p>

        <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-6">
          <div className="text-sm font-black tracking-[0.18em] text-cyan-200">LEARN MORE</div>
          <p className="mt-3 text-slate-200">아래 링크에서 Copilot Studio에 대해 더 알아보세요!</p>
          <a
            href={COPILOT_STUDIO_LINK}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-cyan-200 underline underline-offset-4"
          >
            <ExternalLink size={16} />
            {COPILOT_STUDIO_LINK}
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handlePrint}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-cyan-200 sm:w-auto"
          >
            <Printer size={18} />
            인쇄 / PDF 저장
          </button>
          <button
            onClick={handleDownloadHtml}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            <Download size={18} />
            HTML 다운로드
          </button>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-sm font-black tracking-[0.18em] text-cyan-300">EVENT</div>
          <p className="mt-3 text-xl font-bold text-white">Microsoft AI Tour in Seoul 2026</p>
        </div>
      </div>
    </main>
  );
}
