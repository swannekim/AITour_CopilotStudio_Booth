'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type DialogMsg = {
  text: string;
  speaker?: string;
};

interface GameContextType {
  stage: number;
  goToStage: (s: number) => void;
  collectedHints: number[];
  addHint: (hintId: number) => void;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  dialog: DialogMsg | null;
  showDialog: (msg: DialogMsg) => void;
  hideDialog: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState(() => {
    if (typeof window === 'undefined') return 1;

    const savedStage = window.localStorage.getItem('detective_stage');
    return savedStage ? Number(savedStage) : 1;
  });
  const [collectedHints, setCollectedHints] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];

    const savedHints = window.localStorage.getItem('detective_hints');
    if (!savedHints) return [];

    try {
      return JSON.parse(savedHints);
    } catch {
      return [];
    }
  });
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [dialog, setDialog] = useState<DialogMsg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Delay rendering until after hydration so server and client markup stay aligned.
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('detective_stage', stage.toString());
    localStorage.setItem('detective_hints', JSON.stringify(collectedHints));
  }, [stage, collectedHints, isLoaded]);

  // Timer logic
  useEffect(() => {
    if (stage === 3) return; // Stop timer on ending
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  const addHint = useCallback((hintId: number) => {
    setCollectedHints((prev) => {
      if (!prev.includes(hintId)) return [...prev, hintId];
      return prev;
    });
  }, []);

  const goToStage = useCallback((newStage: number) => {
    setStage(newStage);
    setCollectedHints([]); // Clear hints for the new stage
    setDialog(null);
  }, []);

  const showDialog = useCallback((msg: DialogMsg) => {
    setDialog(msg);
  }, []);

  const hideDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const resetGame = useCallback(() => {
    setStage(1);
    setCollectedHints([]);
    setTimeLeft(300);
    localStorage.removeItem('detective_stage');
    localStorage.removeItem('detective_hints');
    setDialog(null);
  }, []);

  if (!isLoaded) return null;

  return (
    <GameContext.Provider value={{ stage, goToStage, collectedHints, addHint, timeLeft, setTimeLeft, dialog, showDialog, hideDialog, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
