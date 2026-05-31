interface Props {
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
  compact?: boolean
}

export function EmptyState({ title, subtitle, ctaLabel, ctaHref, compact }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center ${compact ? 'py-8' : 'py-12'}`}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--rl-radius-lg)',
          background: 'var(--rl-accent-soft)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--rl-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <div className="flex flex-col gap-2 max-w-[240px]">
        <h2 className="rl-h2">{title}</h2>
        <p className="rl-caption leading-relaxed">{subtitle}</p>
      </div>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="rl-btn rl-btn-primary"
          style={{ width: 'auto', paddingInline: 'var(--rl-space-7)' }}
        >
          {ctaLabel}
        </a>
      )}
    </div>
  )
}
