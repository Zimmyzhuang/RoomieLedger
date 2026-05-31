import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { calculateBalances } from '@/lib/rl/balances'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import { CategoryIcon } from '@/components/rl/CategoryIcon'
import { SetupRequired } from '@/components/rl/SetupRequired'
import type { Category } from '@/types/rl'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function RoommatesPage({ params }: Props) {
  const { groupId } = await params

  const [group, me, roommates, allExpenses, settlements] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    getMe(groupId),
    prisma.roommate.findMany({ where: { groupId }, orderBy: { name: 'asc' } }),
    prisma.expense.findMany({
      where: { groupId },
      include: { participants: true },
    }),
    prisma.settlement.findMany({ where: { groupId } }),
  ])

  if (!group) return null
  if (!me) return <SetupRequired />

  const others = roommates.filter((r) => r.id !== me.id)
  const rawBalances = calculateBalances(me.id, allExpenses, settlements)

  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0)
  const now = new Date()
  const thisMonthTotal = allExpenses
    .filter((e) => e.createdAt.getMonth() === now.getMonth() && e.createdAt.getFullYear() === now.getFullYear())
    .reduce((s, e) => s + e.amount, 0)

  const lastExpenseByRoommate = new Map<string, (typeof allExpenses)[0]>()
  for (const exp of [...allExpenses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )) {
    for (const p of exp.participants) {
      if (!lastExpenseByRoommate.has(p.roommateId)) {
        lastExpenseByRoommate.set(p.roommateId, exp)
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        className="flex-shrink-0 rl-edge-bleed pt-[14px] pb-4"
        style={{ background: 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-[18px] font-extrabold text-white">Roommates</h1>
            <p className="text-[11px] text-white/75">{roommates.length} people · {group.name}</p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-bold text-white border border-white/40 bg-white/20 rounded-full px-[14px] py-[6px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" width={12} height={12}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Invite
          </button>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Total Spent', value: formatCurrency(totalSpent) },
            { label: 'This Month', value: formatCurrency(thisMonthTotal) },
            { label: 'Expenses', value: String(allExpenses.length) },
          ].map((chip) => (
            <div key={chip.label} className="flex-1 bg-white/15 rounded-[12px] p-[8px_10px] text-center">
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-[0.3px] mb-[3px]">{chip.label}</p>
              <p className="text-[15px] font-extrabold text-white">{chip.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
        {others.map((r) => {
          const net = rawBalances.find((b) => b.roommateId === r.id)
          const netCents = net?.netCents ?? 0
          const lastExpense = lastExpenseByRoommate.get(r.id) ?? null

          const isOwed    = netCents > 0
          const isOwing   = netCents < 0
          const isSettled = netCents === 0

          const amountColor = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'
          const dirLabel    = isOwed ? 'owes you' : isOwing ? 'you owe' : ''
          const dirColor    = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'

          const lastDate = lastExpense
            ? new Date(lastExpense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : null

          return (
            <div key={r.id} className="bg-white rounded-[16px] p-[12px_14px] flex items-center gap-3" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
              <div className="relative flex-shrink-0">
                <div
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[17px] font-extrabold text-white"
                  style={{ background: r.color }}
                >
                  {r.name[0]}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[var(--rl-ink)]">{r.name}</p>
                <p className="text-[10px] text-[var(--rl-ink-muted)] font-medium">@{r.handle}</p>
                {lastExpense && (
                  <div className="flex items-center gap-[3px] mt-[3px]">
                    <CategoryIcon category={lastExpense.category as Category} size={14} />
                    <p className="text-[10px] text-[var(--rl-ink-muted)] truncate">
                      {lastExpense.title} · {lastDate}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[16px] font-extrabold leading-none" style={{ color: amountColor }}>
                  {isSettled ? '$0.00' : formatCurrency(Math.abs(netCents))}
                </p>
                {isSettled ? (
                  <span className="inline-flex items-center gap-[3px] text-[9px] font-bold text-[var(--rl-ink-muted)] bg-[#f1f5f9] rounded-full px-[9px] py-[3px] mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width={9} height={9}><polyline points="20 6 9 17 4 12"/></svg>
                    Settled
                  </span>
                ) : (
                  <p className="text-[10px] font-semibold mt-1" style={{ color: dirColor }}>{dirLabel}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
