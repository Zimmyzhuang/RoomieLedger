'use client'

import { useState } from 'react'
import { TransactionCard } from '@/components/rl/TransactionCard'
import { BottomSheet } from '@/components/rl/BottomSheet'
import { TransactionDetail, EXPENSE_DETAIL_TITLE_ID } from '@/components/rl/TransactionDetail'
import type { ExpenseDTO } from '@/types/rl'

interface Props {
  expenses: ExpenseDTO[]
  myId: string
}

export function DashboardClient({ expenses, myId }: Props) {
  const [selected, setSelected] = useState<ExpenseDTO | null>(null)

  return (
    <>
      <ul className="rl-list" aria-label="Recent expenses">
        {expenses.map((e) => (
          <li key={e.id}>
            <TransactionCard expense={e} myId={myId} onClick={() => setSelected(e)} />
          </li>
        ))}
      </ul>
      <BottomSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        titleId={EXPENSE_DETAIL_TITLE_ID}
        closeLabel={selected ? `Close details for ${selected.title}` : 'Close details'}
      >
        {selected && <TransactionDetail expense={selected} myId={myId} />}
      </BottomSheet>
    </>
  )
}
