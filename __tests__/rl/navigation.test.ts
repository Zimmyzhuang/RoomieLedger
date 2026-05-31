import { describe, it, expect } from 'vitest'
import { getMobileNavState } from '@/lib/rl/navigation'

describe('getMobileNavState', () => {
  it('disables back and forward on groups list', () => {
    const state = getMobileNavState('/')
    expect(state?.back).toBeNull()
    expect(state?.forward).toBeNull()
  })

  it('links owes page back to groups and forward to dashboard', () => {
    const state = getMobileNavState('/groups/abc123')
    expect(state?.back?.href).toBe('/')
    expect(state?.forward?.href).toBe('/groups/abc123/home')
  })

  it('cycles tabs from home through people', () => {
    const home = getMobileNavState('/groups/g1/home')
    expect(home?.back?.href).toBe('/groups/g1')
    expect(home?.forward?.href).toBe('/groups/g1/ledger')

    const people = getMobileNavState('/groups/g1/roommates')
    expect(people?.back?.href).toBe('/groups/g1/balances')
    expect(people?.forward?.href).toBe('/groups/g1')
  })
})
