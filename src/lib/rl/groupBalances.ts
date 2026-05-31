interface RawParticipant {
  roommateId: string
  shareAmount: number
}

interface RawExpense {
  paidById: string
  amount: number
  participants: RawParticipant[]
}

interface RawSettlement {
  payerId: string
  receiverId: string
  amount: number
}

export interface SimplifiedDebt {
  fromId: string
  toId: string
  amountCents: number
}

/** Net balance per person: positive = owed money to them, negative = they owe. */
export function calculateGroupNets(
  memberIds: string[],
  expenses: RawExpense[],
  settlements: RawSettlement[],
): Map<string, number> {
  const nets = new Map<string, number>()
  for (const id of memberIds) nets.set(id, 0)

  for (const expense of expenses) {
    nets.set(expense.paidById, (nets.get(expense.paidById) ?? 0) + expense.amount)
    for (const p of expense.participants) {
      nets.set(p.roommateId, (nets.get(p.roommateId) ?? 0) - p.shareAmount)
    }
  }

  for (const s of settlements) {
    nets.set(s.payerId, (nets.get(s.payerId) ?? 0) + s.amount)
    nets.set(s.receiverId, (nets.get(s.receiverId) ?? 0) - s.amount)
  }

  return nets
}

/** Greedy debt simplification: who should pay whom. */
export function simplifyDebts(nets: Map<string, number>): SimplifiedDebt[] {
  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const [id, net] of nets) {
    if (net > 0) creditors.push({ id, amount: net })
    else if (net < 0) debtors.push({ id, amount: -net })
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const debts: SimplifiedDebt[] = []
  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const pay = Math.min(creditors[i].amount, debtors[j].amount)
    if (pay > 0) {
      debts.push({ fromId: debtors[j].id, toId: creditors[i].id, amountCents: pay })
    }
    creditors[i].amount -= pay
    debtors[j].amount -= pay
    if (creditors[i].amount === 0) i++
    if (debtors[j].amount === 0) j++
  }

  return debts
}

export function getGroupDebts(
  memberIds: string[],
  expenses: RawExpense[],
  settlements: RawSettlement[],
): SimplifiedDebt[] {
  const nets = calculateGroupNets(memberIds, expenses, settlements)
  return simplifyDebts(nets)
}
