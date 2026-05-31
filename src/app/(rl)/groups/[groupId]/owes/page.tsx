import { notFound } from 'next/navigation'
import { getGroupDebtsForGroup } from '@/lib/rl/getGroupDebts'
import { DebtRow } from '@/components/rl/DebtRow'
import { EmptyState } from '@/components/rl/EmptyState'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function GroupOwesPage({ params }: Props) {
  const { groupId } = await params
  const data = await getGroupDebtsForGroup(groupId)
  if (!data) notFound()

  const { group, debts } = data

  return (
    <div className="rl-page flex-1">
      <div
        className="rl-edge-bleed"
        style={{ marginTop: 'calc(-1 * var(--rl-space-5))' }}
      >
        <div className="rl-hero">
          <div className="rl-hero-top" style={{ marginBottom: 0 }}>
            <div className="rl-row">
              <div className="rl-emoji-tile" style={{ background: 'rgba(255,255,255,0.18)' }}>
                {group.emoji}
              </div>
              <div className="rl-text-stack" style={{ flex: 'none' }}>
                <h1 className="rl-h1 text-white">{group.name}</h1>
                <p className="rl-caption">Who owes who</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="rl-section flex-1">
        {debts.length === 0 ? (
          <EmptyState
            title="All settled up"
            subtitle="No outstanding balances in this group."
            ctaLabel="Back to dashboard"
            ctaHref={`/?g=${groupId}`}
          />
        ) : (
          <>
            <p className="rl-overline">
              {debts.length} {debts.length === 1 ? 'payment' : 'payments'} to settle
            </p>
            <ul className="rl-list">
              {debts.map((d, i) => (
                <li key={`${d.fromId}-${d.toId}-${i}`}>
                  <DebtRow debt={d} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
