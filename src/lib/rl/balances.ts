interface RawParticipant {
  roommateId: string
  shareAmount: number
}

interface RawExpense {
  id: string
  paidById: string
  participants: RawParticipant[]
}

interface RawSettlement {
  payerId: string
  receiverId: string
  amount: number
}

export interface NetBalance {
  roommateId: string
  netCents: number
}

export function calculateBalances(
  myId: string,
  expenses: RawExpense[],
  settlements: RawSettlement[],
): NetBalance[] {
  const net = new Map<string, number>()

  for (const expense of expenses) {
    if (expense.paidById === myId) {
      for (const p of expense.participants) {
        if (p.roommateId === myId) continue
        net.set(p.roommateId, (net.get(p.roommateId) ?? 0) + p.shareAmount)
      }
    } else {
      const myShare = expense.participants.find((p) => p.roommateId === myId)
      if (myShare) {
        net.set(
          expense.paidById,
          (net.get(expense.paidById) ?? 0) - myShare.shareAmount,
        )
      }
    }
  }

  for (const s of settlements) {
    if (s.payerId === myId) {
      net.set(s.receiverId, (net.get(s.receiverId) ?? 0) + s.amount)
    } else if (s.receiverId === myId) {
      net.set(s.payerId, (net.get(s.payerId) ?? 0) - s.amount)
    }
  }

  return Array.from(net.entries()).map(([roommateId, netCents]) => ({
    roommateId,
    netCents,
  }))
}
