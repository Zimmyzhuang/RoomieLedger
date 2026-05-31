import type { Category } from '@/types/rl'

const CONFIGS: Record<Category, { bg: string; stroke: string; path: string; label: string }> = {
  groceries: {
    bg: '#f0fdfa',
    stroke: '#0d9488',
    path: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
    label: 'Groceries',
  },
  utilities: {
    bg: '#fef3c7',
    stroke: '#b45309',
    path: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    label: 'Utilities',
  },
  food: {
    bg: '#fdf2f8',
    stroke: '#be185d',
    path: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>',
    label: 'Food',
  },
  rent: {
    bg: '#eff6ff',
    stroke: '#1d4ed8',
    path: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    label: 'Rent',
  },
  internet: {
    bg: '#f0f9ff',
    stroke: '#0369a1',
    path: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    label: 'Internet',
  },
  other: {
    bg: '#f8fafc',
    stroke: '#475569',
    path: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    label: 'Other',
  },
}

interface Props {
  category: Category
  compact?: boolean
  /** Set when icon is the sole representation of category (rare). */
  showLabel?: boolean
}

export function CategoryIcon({ category, compact, showLabel }: Props) {
  const cfg = CONFIGS[category] ?? CONFIGS.other
  const box = compact ? 16 : 'var(--rl-icon-md)'
  const glyph = compact ? 10 : 'calc(var(--rl-icon-md) * 0.48)'

  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: box,
        height: box,
        background: cfg.bg,
        borderRadius: compact ? 4 : 'var(--rl-radius-sm)',
      }}
      role={showLabel ? 'img' : undefined}
      aria-label={showLabel ? cfg.label : undefined}
      aria-hidden={showLabel ? undefined : true}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={glyph}
        height={glyph}
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: cfg.path }}
      />
    </div>
  )
}
