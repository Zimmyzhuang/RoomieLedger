import Link from 'next/link'
import type { GroupDTO } from '@/types/rl'

interface Props {
  group: GroupDTO
}

export function GroupCard({ group }: Props) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="bg-white rounded-[16px] p-[14px_16px] flex items-center gap-[12px] transition-opacity hover:opacity-90"
      style={{ boxShadow: 'var(--rl-shadow-card)' }}
    >
      <div
        className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center text-[24px] flex-shrink-0"
        style={{ background: 'var(--rl-teal-light)' }}
      >
        {group.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-extrabold text-[var(--rl-ink)] truncate">{group.name}</p>
        <p className="text-[11px] text-[var(--rl-ink-muted)] mt-[2px]">
          {group.memberCount} {group.memberCount === 1 ? 'person' : 'people'}
          {group.unsettledDebtCount > 0 && (
            <span style={{ color: 'var(--rl-teal)' }}>
              {' '}
              · {group.unsettledDebtCount} unsettled
            </span>
          )}
        </p>
      </div>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--rl-ink-muted)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}
        className="flex-shrink-0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  )
}
