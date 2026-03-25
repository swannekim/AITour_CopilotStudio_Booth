'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ChatPanel } from '@/components/ChatPanel';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isCertificatePage = pathname.startsWith('/certificate');

  if (isCertificatePage) {
    return <div className="h-screen w-screen overflow-y-auto overflow-x-hidden">{children}</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="relative min-w-0 flex-1 border-r border-slate-700/50">{children}</div>
      <ChatPanel />
    </div>
  );
}
