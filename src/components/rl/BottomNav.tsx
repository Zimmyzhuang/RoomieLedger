'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

function resolveGroupId(pathname: string, searchParams: URLSearchParams): string | null {
  const fromPath = pathname.match(/^\/groups\/([^/]+)/)?.[1]
  if (fromPath) return fromPath
  const fromQuery = searchParams.get('g')
  return fromQuery || null
}

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const groupId = resolveGroupId(pathname, searchParams)

  if (!groupId) return null

  const groupsHref = `/?g=${groupId}`
  const base = `/groups/${groupId}`

  const NAV_ITEMS = [
    {
      href: groupsHref,
      label: 'Groups',
      match: (p: string) => p === '/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rl-nav-icon" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      href: `${base}/ledger`,
      label: 'Activity',
      match: (p: string) => p.endsWith('/ledger'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rl-nav-icon" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    { href: `${base}/add`, label: 'Add', match: () => false, fab: true },
    {
      href: `${base}/balances`,
      label: 'Balances',
      match: (p: string) => p.endsWith('/balances') || p.endsWith('/owes'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rl-nav-icon" aria-hidden="true">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
    },
    {
      href: `${base}/account`,
      label: 'Account',
      match: (p: string) => p.endsWith('/account') || p.endsWith('/roommates'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rl-nav-icon" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="rl-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        if ('fab' in item && item.fab) {
          const isAddPage = pathname.endsWith('/add')
          return (
            <Link
              key="add"
              href={item.href}
              className={`rl-nav-slot ${isAddPage ? 'rl-nav-slot-active' : ''}`}
              aria-current={isAddPage ? 'page' : undefined}
            >
              <span className="rl-nav-fab" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="rl-nav-icon">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <span className="rl-nav-label">{item.label}</span>
            </Link>
          )
        }

        const isActive = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rl-nav-slot ${isActive ? 'rl-nav-slot-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon}
            <span className="rl-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
