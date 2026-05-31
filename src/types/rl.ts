export interface GroupDTO {
  id: string
  name: string
  emoji: string
  memberCount: number
  unsettledDebtCount: number
}

export interface GroupDebtDTO {
  fromId: string
  fromName: string
  fromColor: string
  toId: string
  toName: string
  toColor: string
  amountCents: number
}

export type Category =
  | 'groceries'
  | 'utilities'
  | 'food'
  | 'rent'
  | 'internet'
  | 'other'

export interface RoommateDTO {
  id: string
  name: string
  handle: string
  color: string
}

export interface ParticipantDTO {
  roommateId: string
  name: string
  shareAmount: number // cents
  settled: boolean
}

export interface ExpenseDTO {
  id: string
  title: string
  amount: number // cents
  category: Category
  paidById: string
  paidByName: string
  createdAt: string // ISO string
  participants: ParticipantDTO[]
}

export interface BalanceDTO {
  roommateId: string
  name: string
  handle: string
  color: string
  netCents: number // positive = they owe you, negative = you owe them
  lastExpenseTitle: string | null
  lastExpenseDate: string | null
  lastExpenseCategory: Category | null
}

export interface CreateExpenseBody {
  groupId: string
  title: string
  amountCents: number
  category: Category
  paidById: string
  participantIds: string[]
}
