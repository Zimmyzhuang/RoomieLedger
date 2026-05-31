import { formatCurrency } from '@/lib/rl/formatCurrency'

export interface AccountProfileData {
  name: string
  handle: string
  color: string
  email: string
  memberSince: string
  groupName: string
  groupEmoji: string
  netCents: number
  expensesPaid: number
}

interface Props {
  profile: AccountProfileData
}

export function AccountProfile({ profile }: Props) {
  const net = profile.netCents
  const netLabel =
    net === 0
      ? 'All settled in this group'
      : net > 0
        ? `You are owed ${formatCurrency(net)}`
        : `You owe ${formatCurrency(Math.abs(net))}`

  return (
    <header className="rl-edge-bleed" style={{ marginTop: 'calc(-1 * var(--rl-space-5))' }}>
      <div className="rl-hero">
        <p className="rl-small" style={{ marginBottom: 'var(--rl-space-5)' }}>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300" aria-hidden="true" />
            Status: Signed in
          </span>
        </p>

        <div className="flex flex-col items-center text-center gap-2">
          <div
            className="rl-avatar rl-avatar-lg"
            style={{ background: profile.color, boxShadow: '0 0 0 4px rgba(255,255,255,0.2)' }}
            aria-hidden="true"
          >
            {profile.name[0]}
          </div>
          <h1 className="rl-h1">{profile.name}</h1>
          <p className="rl-small">@{profile.handle}</p>
          <p className="rl-caption">{profile.email}</p>
          <p className="rl-caption">Member since {profile.memberSince}</p>
        </div>

        <div
          className="mt-5 rounded-[var(--rl-radius-md)] text-center"
          style={{ background: 'rgba(255,255,255,0.12)', padding: 'var(--rl-space-4)' }}
        >
          <p className="rl-overline">Active group</p>
          <p className="rl-body font-semibold mt-1">
            {profile.groupEmoji} {profile.groupName}
          </p>
        </div>
      </div>

      <div className="rl-stat-row" style={{ paddingTop: 'var(--rl-space-5)' }}>
        <div className="rl-card rl-stat-chip" role="group" aria-label={`In this group: ${netLabel}`}>
          <p className="rl-overline">In this group</p>
          <p className="rl-small font-semibold text-[var(--rl-ink)] leading-snug">{netLabel}</p>
        </div>
        <div
          className="rl-card rl-stat-chip"
          role="group"
          aria-label={`Expenses paid: ${profile.expensesPaid}`}
        >
          <p className="rl-overline">Expenses paid</p>
          <p className="rl-amount text-[var(--rl-ink)]">{profile.expensesPaid}</p>
        </div>
      </div>
    </header>
  )
}
