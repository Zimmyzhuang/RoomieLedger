import type { Category } from '@/types/rl'

const CONFIGS: Record<Category, { bg: string; stroke: string; path: string }> = {
  groceries: {
    bg: '#f0fdfa',
    stroke: '#0d9488',
    path: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
  },
  utilities: {
    bg: '#fef3c7',
    stroke: '#d97706',
    path: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  },
  food: {
    bg: '#fdf2f8',
    stroke: '#ec4899',
    path: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>',
  },
  rent: {
    bg: '#eff6ff',
    stroke: '#3b82f6',
    path: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  internet: {
    bg: '#f0f9ff',
    stroke: '#0ea5e9',
    path: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  },
  other: {
    bg: '#f8fafc',
    stroke: '#94a3b8',
    path: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  },
}

interface Props {
  category: Category
  size?: number
}

export function CategoryIcon({ category, size = 38 }: Props) {
  const cfg = CONFIGS[category] ?? CONFIGS.other
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-[11px]"
      style={{ width: size, height: size, background: cfg.bg }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={size * 0.47}
        height={size * 0.47}
        dangerouslySetInnerHTML={{ __html: cfg.path }}
      />
    </div>
  )
}
