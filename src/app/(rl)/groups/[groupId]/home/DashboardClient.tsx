'use client'

import { useState } from 'react'
import { TransactionCard } from '@/components/rl/TransactionCard'
import { BottomSheet } from '@/components/rl/BottomSheet'
import { TransactionDetail } from '@/components/rl/TransactionDetail'
import type { ExpenseDTO } from '@/types/rl'

interface Props {
  expenses: ExpenseDTO[]
  myId: string
}

export function DashboardClient({ expenses, myId }: Props) {
  const [selected, setSelected] = useState<ExpenseDTO | null>(null)

  return (
    <>
      <div className="flex flex-col gap-2">
        {expenses.map((e) => (
          <TransactionCard key={e.id} expense={e} myId={myId} onClick={() => setSelected(e)} />
        ))}
      </div>
      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <TransactionDetail expense={selected} myId={myId} />}
      </BottomSheet>
    </>
  )
}
