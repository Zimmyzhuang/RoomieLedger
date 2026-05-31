import type { ReactNode } from 'react'
import { BottomNav } from '@/components/rl/BottomNav'
import { MobileNavBar } from '@/components/rl/MobileNavBar'

export const metadata = {
  title: 'RoomieLedger',
  description: 'Split expenses with your roommates',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
}

export default function RLLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-col bg-[var(--rl-bg)] w-full"
      style={{
        height: 'calc(100dvh - 2 * var(--rl-shell-pad))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col rl-gutter-x">
        <MobileNavBar />
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
