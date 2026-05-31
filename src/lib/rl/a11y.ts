import { formatCurrency } from '@/lib/rl/formatCurrency'

/** Verbal balance for screen readers (not color-only). */
export function describeNetBalance(netCents: number): string {
  if (netCents === 0) return 'settled up'
  if (netCents > 0) return `you are owed ${formatCurrency(netCents)}`
  return `you owe ${formatCurrency(Math.abs(netCents))}`
}

/** Expense row label for buttons / links. */
export function describeExpenseAction(
  title: string,
  amountLabel: string,
  meta: string,
): string {
  return `${title}, ${amountLabel}, ${meta}`
}
