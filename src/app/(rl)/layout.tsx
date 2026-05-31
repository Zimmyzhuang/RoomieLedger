import type { ReactNode } from 'react'
import { BottomNav } from '@/components/rl/BottomNav'

export const metadata = {
  title: 'RoomieLedger',
  description: 'Split expenses with your roommates',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
}

export default function RLLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-col bg-[var(--rl-bg)]"
      style={{ height: '100dvh', maxWidth: 430, margin: '0 auto' }}
    >
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
