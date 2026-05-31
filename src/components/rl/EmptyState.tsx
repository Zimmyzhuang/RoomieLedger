interface Props {
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ title, subtitle, ctaLabel, ctaHref }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div
        className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
        style={{ background: 'var(--rl-teal-light)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--rl-teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={36} height={36}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 className="text-[17px] font-extrabold text-[var(--rl-ink)]">{title}</h2>
      <p className="text-[12px] text-[var(--rl-ink-muted)] leading-[1.55] max-w-[200px]">{subtitle}</p>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="flex items-center gap-2 text-white text-[13px] font-extrabold rounded-[14px] px-6 py-3 mt-1"
          style={{ background: 'var(--rl-teal)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" width={16} height={16}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {ctaLabel}
        </a>
      )}
    </div>
  )
}
