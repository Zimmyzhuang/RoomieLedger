import { describe, it, expect } from 'vitest'
import { calculateGroupNets, simplifyDebts, getGroupDebts } from '@/lib/rl/groupBalances'

const TIM = 'tim'
const RUBY = 'ruby'
const JAKE = 'jake'

describe('calculateGroupNets', () => {
  it('nets sum to zero for a balanced split', () => {
    const expenses = [
      {
        paidById: TIM,
        amount: 10000,
        participants: [
          { roommateId: TIM, shareAmount: 5000 },
          { roommateId: RUBY, shareAmount: 5000 },
        ],
      },
    ]
    const nets = calculateGroupNets([TIM, RUBY], expenses, [])
    expect(nets.get(TIM)).toBe(5000)
    expect(nets.get(RUBY)).toBe(-5000)
    const total = [...nets.values()].reduce((s, v) => s + v, 0)
    expect(total).toBe(0)
  })
})

describe('simplifyDebts', () => {
  it('produces a single debt when two people split', () => {
    const nets = new Map([
      [TIM, 5000],
      [RUBY, -5000],
    ])
    const debts = simplifyDebts(nets)
    expect(debts).toEqual([{ fromId: RUBY, toId: TIM, amountCents: 5000 }])
  })

  it('simplifies three-person balances', () => {
    const expenses = [
      {
        paidById: TIM,
        amount: 12000,
        participants: [
          { roommateId: TIM, shareAmount: 4000 },
          { roommateId: RUBY, shareAmount: 4000 },
          { roommateId: JAKE, shareAmount: 4000 },
        ],
      },
    ]
    const debts = getGroupDebts([TIM, RUBY, JAKE], expenses, [])
    const total = debts.reduce((s, d) => s + d.amountCents, 0)
    expect(total).toBe(8000)
    expect(debts.every((d) => d.fromId !== d.toId)).toBe(true)
  })
})
