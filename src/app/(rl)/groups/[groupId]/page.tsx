import Link from 'next/link'
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
    <div className="flex flex-col flex-1">
      <div className="flex-shrink-0 rl-edge-bleed pt-2 pb-5" style={{ background: 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[28px]">{group.emoji}</span>
          <div>
            <h1 className="text-[20px] font-extrabold text-white leading-tight">{group.name}</h1>
            <p className="text-[11px] text-white/75 mt-[2px]">Who owes who</p>
          </div>
        </div>
      </div>

      <div className="flex-1 pt-4 pb-4 flex flex-col gap-2">
        {debts.length === 0 ? (
          <EmptyState
            title="All settled up"
            subtitle="No outstanding balances in this group."
            ctaLabel="View activity"
            ctaHref={`/groups/${groupId}/home`}
          />
        ) : (
          <>
            <p className="text-[12px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.4px] mb-1">
              {debts.length} {debts.length === 1 ? 'payment' : 'payments'} to settle
            </p>
            {debts.map((d, i) => (
              <DebtRow key={`${d.fromId}-${d.toId}-${i}`} debt={d} />
            ))}
          </>
        )}
      </div>

      <div className="flex-shrink-0 pb-2">
        <Link
          href={`/groups/${groupId}/home`}
          className="block w-full text-center rounded-[14px] py-3 text-[13px] font-extrabold text-white"
          style={{ background: 'var(--rl-teal)', boxShadow: 'var(--rl-shadow-strong)' }}
        >
          Open group dashboard
        </Link>
      </div>
    </div>
  )
}
