'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getMobileNavState } from '@/lib/rl/navigation'

function NavButton({
  label,
  href,
  disabled,
  direction,
  variant,
}: {
  label: string
  href?: string
  disabled?: boolean
  direction: 'back' | 'forward'
  variant: 'light' | 'teal'
}) {
  const isTeal = variant === 'teal'
  const enabledClass = isTeal
    ? 'bg-white/20 text-white active:bg-white/30'
    : 'bg-[#f1f5f9] text-[var(--rl-ink)] active:bg-[#e2e8f0]'
  const disabledClass = isTeal
    ? 'bg-white/8 text-white/35 cursor-not-allowed'
    : 'bg-[#f8fafc] text-[var(--rl-ink-muted)]/40 cursor-not-allowed'

  const icon =
    direction === 'back' ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={20} height={20} aria-hidden>
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={20} height={20} aria-hidden>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    )

  const className = `w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors ${
    disabled ? disabledClass : enabledClass
  }`

  if (disabled || !href) {
    return (
      <button type="button" disabled aria-label={label} className={className}>
        {icon}
      </button>
    )
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {icon}
    </Link>
  )
}

export function MobileNavBar() {
  const pathname = usePathname()
  const state = getMobileNavState(pathname)

  if (!state) return null

  const isTeal = state.variant === 'teal'

  return (
    <div
      className="flex-shrink-0 rl-edge-bleed sticky top-0 z-10 border-b"
      style={{
        background: isTeal ? 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' : 'var(--rl-card)',
        borderColor: isTeal ? 'rgba(255,255,255,0.15)' : 'var(--rl-border)',
      }}
    >
      <div className="flex items-center gap-2 py-2 min-h-[52px]">
        <NavButton
          direction="back"
          label={state.back ? `Back to ${state.back.label}` : 'Back'}
          href={state.back?.href}
          disabled={!state.back}
          variant={state.variant}
        />

        <div className="flex-1 min-w-0 text-center px-1">
          <p
            className={`text-[13px] font-extrabold truncate ${isTeal ? 'text-white' : 'text-[var(--rl-ink)]'}`}
          >
            {state.title}
          </p>
          {(state.back || state.forward) && (
            <p className={`text-[10px] font-medium truncate mt-[1px] ${isTeal ? 'text-white/70' : 'text-[var(--rl-ink-muted)]'}`}>
              {state.back && state.forward
                ? `${state.back.label} · ${state.forward.label}`
                : state.back?.label ?? state.forward?.label}
            </p>
          )}
        </div>

        <NavButton
          direction="forward"
          label={state.forward ? `Next: ${state.forward.label}` : 'Forward'}
          href={state.forward?.href}
          disabled={!state.forward}
          variant={state.variant}
        />
      </div>
    </div>
  )
}
