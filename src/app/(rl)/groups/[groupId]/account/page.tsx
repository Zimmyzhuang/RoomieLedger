import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { calculateBalances } from '@/lib/rl/balances'
import { AccountProfile } from '@/components/rl/AccountProfile'
import { AccountSettings } from '@/components/rl/AccountSettings'
import { GroupMemberCard } from '@/components/rl/GroupMemberCard'
import { SetupRequired } from '@/components/rl/SetupRequired'
import type { Category } from '@/types/rl'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function AccountPage({ params }: Props) {
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
  const nets = rawBalances
  const totalOwed = nets.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)
  const totalOwing = nets.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
  const netCents = totalOwed - totalOwing
  const expensesPaid = allExpenses.filter((e) => e.paidById === me.id).length

  const memberSince = me.createdAt.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

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
    <div className="rl-account-page">
      <AccountProfile
        profile={{
          name: me.name,
          handle: me.handle,
          color: me.color,
          email: `${me.handle}@roomieledger.app`,
          memberSince,
          groupName: group.name,
          groupEmoji: group.emoji,
          netCents,
          expensesPaid,
        }}
      />

      <AccountSettings />

      <section className="rl-section" aria-labelledby="group-members-heading">
          <div className="rl-section-header">
            <h2 id="group-members-heading" className="rl-h2">
              Group members
            </h2>
            <span className="rl-caption">{roommates.length} people</span>
          </div>
          <ul className="rl-list">
            {others.map((r) => {
              const net = rawBalances.find((b) => b.roommateId === r.id)
              const last = lastExpenseByRoommate.get(r.id) ?? null
              const lastDate = last
                ? new Date(last.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : null

              return (
                <li key={r.id}>
                  <GroupMemberCard
                    name={r.name}
                    handle={r.handle}
                    color={r.color}
                    netCents={net?.netCents ?? 0}
                    lastExpenseTitle={last?.title ?? null}
                    lastExpenseDate={lastDate}
                    lastExpenseCategory={(last?.category as Category) ?? null}
                  />
                </li>
              )
            })}
          </ul>
      </section>
    </div>
  )
}
