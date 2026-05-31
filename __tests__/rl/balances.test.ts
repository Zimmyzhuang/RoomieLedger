import { describe, it, expect } from 'vitest'
import { calculateBalances } from '@/lib/rl/balances'

const ME = 'user-timothy'
const RUBY = 'user-ruby'
const JAKE = 'user-jake'

describe('calculateBalances', () => {
  it('returns zero balance when no expenses', () => {
    const result = calculateBalances(ME, [], [])
    expect(result).toEqual([])
  })

  it('records positive balance when others owe me', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: ME,
        participants: [
          { roommateId: ME, shareAmount: 5000 },
          { roommateId: RUBY, shareAmount: 5000 },
        ],
      },
    ]
    const result = calculateBalances(ME, expenses, [])
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance?.netCents).toBe(5000) // Ruby owes me
  })

  it('records negative balance when I owe others', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: RUBY,
        participants: [
          { roommateId: ME, shareAmount: 3000 },
          { roommateId: RUBY, shareAmount: 3000 },
        ],
      },
    ]
    const result = calculateBalances(ME, expenses, [])
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance?.netCents).toBe(-3000) // I owe Ruby
  })

  it('applies settlement when they owe me (payerId = them)', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: ME,
        participants: [
          { roommateId: ME, shareAmount: 5000 },
          { roommateId: RUBY, shareAmount: 5000 },
        ],
      },
    ]
    const settlements = [{ payerId: RUBY, receiverId: ME, amount: 5000 }]
    const result = calculateBalances(ME, expenses, settlements)
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance).toBeDefined()
    expect(rubyBalance!.netCents).toBe(0)
  })

  it('applies settlement when I owe them (payerId = me)', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: RUBY,
        participants: [
          { roommateId: ME, shareAmount: 3000 },
          { roommateId: RUBY, shareAmount: 3000 },
        ],
      },
    ]
    const settlements = [{ payerId: ME, receiverId: RUBY, amount: 3000 }]
    const result = calculateBalances(ME, expenses, settlements)
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance).toBeDefined()
    expect(rubyBalance!.netCents).toBe(0)
  })

  it('handles multiple people correctly', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: ME,
        participants: [
          { roommateId: ME, shareAmount: 4000 },
          { roommateId: RUBY, shareAmount: 4000 },
          { roommateId: JAKE, shareAmount: 4000 },
        ],
      },
    ]
    const result = calculateBalances(ME, expenses, [])
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    const jakeBalance = result.find((b) => b.roommateId === JAKE)
    expect(rubyBalance).toBeDefined()
    expect(jakeBalance).toBeDefined()
    expect(rubyBalance!.netCents).toBe(4000)
    expect(jakeBalance!.netCents).toBe(4000)
  })
})
