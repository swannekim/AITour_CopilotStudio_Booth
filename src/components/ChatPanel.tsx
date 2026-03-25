'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Script from 'next/script';
import { useGame } from '@/store/GameState';

type CertificateRequest = {
  name: string;
  mail: string;
};

type WebChatAction = {
  type: string;
  payload?: unknown;
};

type WebChatStoreLike = {
  dispatch: (action: WebChatAction) => void;
};

type WebChatApi = {
  createStore: (
    initialState: Record<string, never>,
    enhancer: () => (next: (action: WebChatAction) => WebChatAction) => (action: WebChatAction) => WebChatAction
  ) => WebChatStoreLike;
  createDirectLine: (options: { secret: string }) => unknown;
  renderWebChat: (
    options: {
      directLine: unknown;
      store: WebChatStoreLike;
      locale: string;
      styleOptions: Record<string, string | boolean>;
    },
    element: HTMLElement
  ) => void;
};

let webChatStore: WebChatStoreLike | null = null;

const CHAT_PANEL_STORAGE_KEY = 'chat-panel-width';
const DEFAULT_CHAT_PANEL_WIDTH = 440;
const MIN_CHAT_PANEL_WIDTH = 240;
const DESKTOP_MIN_CHAT_PANEL_WIDTH = 320;
const MAX_CHAT_PANEL_WIDTH = 560;
const MIN_MAIN_AREA_WIDTH = 420;

const getChatPanelBounds = (viewportWidth: number) => {
  const maxWidth = Math.min(
    MAX_CHAT_PANEL_WIDTH,
    Math.max(MIN_CHAT_PANEL_WIDTH, viewportWidth - MIN_MAIN_AREA_WIDTH)
  );
  const minWidth = Math.min(maxWidth, viewportWidth < 900 ? MIN_CHAT_PANEL_WIDTH : DESKTOP_MIN_CHAT_PANEL_WIDTH);

  return { minWidth, maxWidth };
};

const clampChatPanelWidth = (width: number, viewportWidth: number) => {
  const { minWidth, maxWidth } = getChatPanelBounds(viewportWidth);
  return Math.min(maxWidth, Math.max(minWidth, Math.round(width)));
};

const getDefaultChatPanelWidth = (viewportWidth: number) =>
  clampChatPanelWidth(Math.round(viewportWidth * 0.34), viewportWidth);

export function ChatPanel() {
  const { stage, collectedHints } = useGame();
  const [isWebChatLoaded, setIsWebChatLoaded] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [botStatus, setBotStatus] = useState('대기 중...');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pendingCertificateRequestRef = useRef<CertificateRequest | null>(null);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_CHAT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_CHAT_PANEL_WIDTH);

  const directLineSecret = process.env.NEXT_PUBLIC_DIRECT_LINE_SECRET || '';
  console.log('DL secret length:', directLineSecret.length);
  // const directLineSecret = '8ooQOPojaBtfFbNODZRauzRLHZfgm3i5KBI3s0TpB3pNbP4aXGQQJQQJ99CCACqBBLyAArohAAABAZBS11NX'
  const webChatApi =
    typeof window === 'undefined' ? undefined : (window as Window & { WebChat?: WebChatApi }).WebChat;

  const stopResizing = useCallback(() => {
    activePointerIdRef.current = null;
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  const sendBotEvent = useCallback((name: string, value: unknown) => {
    if (!webChatStore) return;

    webChatStore.dispatch({
      type: 'WEB_CHAT/SEND_EVENT',
      payload: { name, value },
    });
  }, []);

  const flushPendingCertificateRequest = useCallback(() => {
    if (!isChatStarted || !webChatStore || !pendingCertificateRequestRef.current) return;

    sendBotEvent('certificateRequest', pendingCertificateRequestRef.current);
    console.log('[Bridge] certificateRequest →', pendingCertificateRequestRef.current);
    pendingCertificateRequestRef.current = null;
  }, [isChatStarted, sendBotEvent]);

  const startChat = () => {
    if (!isWebChatLoaded || !webChatApi) return;

    setIsChatStarted(true);
    setBotStatus('연결 중...');

    if (!webChatStore) {
      webChatStore = webChatApi.createStore(
        {},
        () => (next: (action: WebChatAction) => WebChatAction) => (action: WebChatAction) => next(action)
      );
    }

    const directLine = webChatApi.createDirectLine({
      secret: directLineSecret,
    });

    if (chatContainerRef.current) {
      webChatApi.renderWebChat(
        {
          directLine,
          store: webChatStore,
          locale: 'ko-KR',
          styleOptions: {
            hideUploadButton: true,
            botAvatarInitials: '🕵️‍♂️',
            userAvatarInitials: '👤',
            primaryFont: "'Geist Sans', sans-serif",
            rootHeight: '100%',
            backgroundColor: '#1a1a2e',
            bubbleBackground: '#1e1e35',
            bubbleTextColor: '#e6edf3',
            bubbleBorderColor: '#30363d',
            bubbleFromUserBackground: '#e3b341',
            bubbleFromUserTextColor: '#1a1a2e',
            sendBoxBackground: '#111827',
            sendBoxTextColor: '#e6edf3',
            sendBoxBorderTop: '1px solid rgba(255,255,255,.1)',
            inputBorderColor: 'transparent',
            timestampColor: 'rgba(255,255,255,.3)',
          },
        },
        chatContainerRef.current
      );

      setBotStatus('연결됨');

      setTimeout(() => {
        sendBotEvent('startConversation', {});

        const initialContext = {
          gCurrentStage: stage,
          gCurrentHints: collectedHints.length,
          gCurrentStageLabel:
            stage === 1 && collectedHints.length > 0
              ? 'CLUE_FOUND'
              : stage === 2
                ? 'CODE_KNOWN'
                : stage === 3
                  ? 'ESCAPED'
                  : 'START',
          gClearTime: '',
        };

        sendBotEvent('setContext', initialContext);
        console.log('[Bridge] Initial setContext →', initialContext);
        flushPendingCertificateRequest();
      }, 800);
    }
  };

  useEffect(() => {
    if (!isChatStarted || !webChatStore) return;

    let stageLabel = 'START';
    if (stage === 1 && collectedHints.length > 0) stageLabel = 'CLUE_FOUND_1';

    if (stage === 2 && collectedHints.length === 0) stageLabel = 'CODE_KNOWN';
    if (stage === 2 && collectedHints.length > 0) stageLabel = 'CLUE_FOUND_2';

    if (stage === 3) stageLabel = 'ESCAPED';

    const contextValue = {
      gCurrentStage: stage,
      gCurrentHints: collectedHints.length,
      gCurrentStageLabel: stageLabel,
      gClearTime: '',
    };

    sendBotEvent('setContext', contextValue);
    console.log('[Bridge] setContext →', contextValue);
  }, [stage, collectedHints.length, isChatStarted, sendBotEvent]);

  useEffect(() => {
    const handleCertificateRequest = (event: Event) => {
      const customEvent = event as CustomEvent<CertificateRequest>;
      const detail = customEvent.detail;

      if (!detail?.name || !detail?.mail) return;

      pendingCertificateRequestRef.current = detail;

      if (isChatStarted && webChatStore) {
        flushPendingCertificateRequest();
      }
    };

    window.addEventListener('certificate-request', handleCertificateRequest as EventListener);

    return () => {
      window.removeEventListener('certificate-request', handleCertificateRequest as EventListener);
    };
  }, [flushPendingCertificateRequest, isChatStarted]);

  useEffect(() => {
    const savedWidth = window.localStorage.getItem(CHAT_PANEL_STORAGE_KEY);
    const parsedWidth = savedWidth ? Number(savedWidth) : Number.NaN;
    const initialWidth = Number.isFinite(parsedWidth)
      ? clampChatPanelWidth(parsedWidth, window.innerWidth)
      : getDefaultChatPanelWidth(window.innerWidth);
    const frameId = window.requestAnimationFrame(() => {
      setPanelWidth(initialWidth);
    });

    const handleResize = () => {
      setPanelWidth((currentWidth) => clampChatPanelWidth(currentWidth, window.innerWidth));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CHAT_PANEL_STORAGE_KEY, String(panelWidth));
  }, [panelWidth]);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;

      const deltaX = dragStartXRef.current - event.clientX;
      const nextWidth = clampChatPanelWidth(dragStartWidthRef.current + deltaX, window.innerWidth);
      setPanelWidth(nextWidth);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
      stopResizing();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isResizing, stopResizing]);

  useEffect(() => () => stopResizing(), [stopResizing]);

  const handleResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();

    activePointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartWidthRef.current = panelWidth;

    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    setIsResizing(true);
  };

  return (
    <div
      className="relative z-50 flex h-full shrink-0 flex-col border-l border-slate-700/50 bg-[#f5f5f5] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
      style={{ width: `${panelWidth}px` }}
    >
      <button
        type="button"
        aria-label="Resize chat panel"
        title="Drag to resize"
        onPointerDown={handleResizeStart}
        className="absolute inset-y-0 left-0 z-30 w-4 -translate-x-1/2 cursor-col-resize touch-none border-0 bg-transparent"
      >
        <span
          className={`absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full transition-colors ${
            isResizing ? 'bg-[#50e6ff]' : 'bg-white/15 hover:bg-white/40'
          }`}
        />
      </button>

      <Script
        src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"
        onLoad={() => setIsWebChatLoaded(true)}
      />

      <div className="flex items-center justify-center gap-[10px] border-b border-white/10 bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] py-[10px] text-center text-[0.78rem] uppercase tracking-[2px] text-white/75">
        <div className="flex items-center gap-[6px]">
          <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-[#0078d4] to-[#50e6ff] text-[0.85rem] shadow-[0_0_8px_rgba(80,230,255,0.35)]">
            ✨
          </div>
          <span>
            <strong>Powered by</strong>{' '}
            <em className="not-italic font-semibold text-[#50e6ff]">Copilot Studio</em>
          </span>
        </div>
      </div>

      <div className="z-10 flex items-center gap-[14px] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-[18px_20px_16px] shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
        <div className="relative shrink-0">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#e3b341] to-[#f0a500] text-[1.8rem] shadow-[0_0_0_3px_rgba(227,179,65,0.35)]">
            🕵️‍♂️
          </div>
          {isChatStarted && (
            <div className="absolute bottom-[2px] right-[2px] h-[12px] w-[12px] rounded-full border-2 border-[#16213e] bg-[#4caf50] shadow-[0_0_6px_#4caf50]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[1rem] font-bold text-white">왓슨</div>
          <div className="mt-[2px] text-[0.72rem] text-white/55">탐정의 비밀 수첩 도우미</div>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap rounded-[10px] border px-[9px] py-[3px] text-[0.65rem] ${
            isChatStarted
              ? 'border-[#4caf50] bg-[#4caf50]/25 text-[#a5d6a7]'
              : 'border-white/20 bg-white/15 text-white/70'
          }`}
        >
          {botStatus}
        </span>
      </div>

      {!isChatStarted && (
        <div className="flex flex-1 flex-col items-center justify-center gap-[16px] bg-gradient-to-b from-[#1e1e30] to-[#111827] p-[28px_24px]">
          <div className="animate-[bounce_3s_ease-in-out_infinite] text-[3.5rem] drop-shadow-[0_0_16px_rgba(227,179,65,0.5)]">
            🕵️‍♂️
          </div>
          <div className="text-center text-[1.1rem] font-bold text-[#e3b341]">안녕하세요, 저는 왓슨입니다!</div>
          <div className="max-w-[280px] text-center text-[0.82rem] leading-[1.6] text-white/55">
            탐정님의 비밀 수첩 조수로, 여러분의 탈출을 돕겠습니다. 힌트가 필요하면 언제든지 묻어보세요!
          </div>

          <div className="mt-2 w-full max-w-[300px] rounded-[10px] border border-white/10 bg-white/5 p-[12px_16px]">
            <p className="mb-[6px] text-[0.75rem] uppercase tracking-[1px] text-white/45">학습 가이드</p>
            <ul>
              <li className="list-none border-b border-white/5 py-[4px] text-[0.8rem] text-white/70 before:content-['💡_']">
                &quot;힌트를 줘&quot; 라고 말하세요
              </li>
              <li className="list-none border-b border-white/5 py-[4px] text-[0.8rem] text-white/70 before:content-['💡_']">
                &quot;다음 단계 알려줘&quot; 라고 해보세요
              </li>
              <li className="list-none py-[4px] text-[0.8rem] text-white/70 before:content-['💡_']">
                &quot;어떻게 풀어요?&quot; 라고 질문하세요
              </li>
            </ul>
          </div>

          <button
            onClick={startChat}
            disabled={!isWebChatLoaded}
            className="mt-[4px] cursor-pointer rounded-[28px] border-none bg-gradient-to-r from-[#e3b341] to-[#f0a500] px-[32px] py-[12px] text-[0.95rem] font-bold text-[#1a1a2e] shadow-[0_4px_18px_rgba(227,179,65,0.45)] transition-all hover:-translate-y-[2px] hover:shadow-[0_6px_24px_rgba(227,179,65,0.6)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isWebChatLoaded ? '💬 채팅 시작하기' : '로딩 중...'}
          </button>
        </div>
      )}

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-hidden"
        style={{ display: isChatStarted ? 'block' : 'none' }}
      />
    </div>
  );
}
