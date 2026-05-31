export function formatCurrency(cents: number): string {
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const remaining = abs % 100
  return `$${dollars}.${remaining.toString().padStart(2, '0')}`
}

export function formatSign(cents: number): string {
  if (cents === 0) return formatCurrency(0)
  return cents > 0 ? `+${formatCurrency(cents)}` : `-${formatCurrency(cents)}`
}
