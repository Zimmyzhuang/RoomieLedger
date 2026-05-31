import { prisma } from '@/lib/rl/db'
import { AddExpenseForm } from './AddExpenseForm'
import Link from 'next/link'

export default async function AddExpensePage() {
  const roommates = await prisma.roommate.findMany({ orderBy: { name: 'asc' } })
  const me = roommates[0]

  const dtos = roommates.map((r) => ({
    id: r.id,
    name: r.name,
    handle: r.handle,
    color: r.color,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white px-4 py-[13px] border-b border-[var(--rl-border)] flex items-center gap-[10px] flex-shrink-0">
        <Link href="/" className="w-[32px] h-[32px] rounded-[10px] bg-[#f1f5f9] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="text-[16px] font-extrabold text-[var(--rl-ink)]">Add Expense</h1>
      </div>
      <AddExpenseForm roommates={dtos} myId={me.id} />
    </div>
  )
}
