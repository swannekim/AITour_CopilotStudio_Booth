'use client';

import { ReactNode } from 'react';
import { GameProvider } from '@/store/GameState';

export function Providers({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
