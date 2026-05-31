import Link from 'next/link'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import { StatChip } from '@/components/rl/StatChip'
import { EmptyState } from '@/components/rl/EmptyState'
import { DashboardClient } from '@/components/rl/DashboardClient'
import type { GroupDashboardData } from '@/lib/rl/getGroupDashboard'

interface Props {
  dashboard: GroupDashboardData
}

export function GroupDashboardPanel({ dashboard }: Props) {
  const {
    groupId,
    groupName,
    groupEmoji,
    meName,
    roommateCount,
    totalOwing,
    totalOwed,
    unsettled,
    expenses,
    myId,
  } = dashboard

  const net = totalOwed - totalOwing
  const base = `/groups/${groupId}`

  return (
    <div className="rl-block-gap flex flex-col gap-5">
      <div className="rl-edge-bleed">
        <div className="rl-hero" role="region" aria-label={`${groupName} balance overview`}>
          <div className="rl-hero-top">
            <div>
              <p className="rl-overline">
                {groupEmoji} {groupName}
              </p>
              <p className="rl-hero-name">{meName}</p>
            </div>
            <div className="rl-avatar rl-avatar-sm" style={{ background: 'rgba(255,255,255,0.22)' }}>
              {meName[0]}
            </div>
          </div>
          <p className="rl-overline">Total balance</p>
          <p className="rl-hero-metric">
            {net >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(net))}
          </p>
          <p className="rl-caption">{roommateCount} people in group</p>
        </div>
      </div>

      <div className="rl-stat-row" role="region" aria-label="Balance summary">
        <StatChip label="You owe" value={totalOwing} color="red" />
        <StatChip label="Owed to you" value={totalOwed} color="green" />
        <StatChip label="Unsettled" value={String(unsettled)} color="amber" />
      </div>

      <nav className="rl-chip-scroll no-scrollbar" aria-label="Quick links">
        {[
          { href: `${base}/owes`, label: 'Settle up' },
          { href: `${base}/ledger`, label: 'Activity' },
          { href: `${base}/balances`, label: 'Balances' },
          { href: `${base}/account`, label: 'Account' },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className="rl-pill-link flex-shrink-0">
            {tab.label}
          </Link>
        ))}
      </nav>

      <section className="rl-section" aria-labelledby="recent-expenses-heading">
        <h2 id="recent-expenses-heading" className="rl-h2">
          Recent expenses
        </h2>
        {expenses.length === 0 ? (
          <EmptyState
            compact
            title="No expenses yet"
            subtitle="Use the Add button below to log a shared expense."
          />
        ) : (
          <DashboardClient expenses={expenses} myId={myId} />
        )}
      </section>
    </div>
  )
}
