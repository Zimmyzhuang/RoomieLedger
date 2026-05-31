import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { BottomNav } from '@/components/rl/BottomNav'
import { SkipLink } from '@/components/rl/SkipLink'

export const metadata = {
  title: 'RoomieLedger',
  description: 'Split expenses with your roommates',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
}

export default function RLLayout({ children }: { children: ReactNode }) {
  return (
    <div className="rl-shell">
      <SkipLink />
      <main id="main-content" className="rl-main" tabIndex={-1}>
        {children}
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
