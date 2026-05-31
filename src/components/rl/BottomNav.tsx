'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function getGroupBase(pathname: string): string | null {
  const match = pathname.match(/^\/groups\/([^/]+)/)
  return match ? `/groups/${match[1]}` : null
}

export function BottomNav() {
  const pathname = usePathname()
  const base = getGroupBase(pathname)

  if (!base) return null

  const isOwesOnly = pathname === base
  if (isOwesOnly) return null

  const NAV_ITEMS = [
    {
      href: `${base}/home`,
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: `${base}/ledger`,
      label: 'Ledger',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    { href: `${base}/add`, label: 'Add', icon: null },
    {
      href: `${base}/balances`,
      label: 'Balances',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
    },
    {
      href: `${base}/roommates`,
      label: 'People',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="bg-white border-t border-[var(--rl-border)] flex items-center justify-around px-1 pt-2 pb-4 flex-shrink-0">
      {NAV_ITEMS.map((item) => {
        if (item.label === 'Add') {
          return (
            <Link
              key="add"
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 text-[9.5px] font-bold text-[var(--rl-teal)]"
            >
              <span
                className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center -mt-2"
                style={{ background: 'var(--rl-teal)', boxShadow: 'var(--rl-shadow-strong)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-[22px] h-[22px]">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              Add
            </Link>
          )
        }

        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 flex-1 text-[9.5px] font-semibold min-w-0 ${
              isActive ? 'text-[var(--rl-teal)]' : 'text-[var(--rl-ink-muted)]'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
