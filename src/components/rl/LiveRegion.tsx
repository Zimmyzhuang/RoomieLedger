'use client'

interface Props {
  message: string
  politeness?: 'polite' | 'assertive'
}

/** Announces dynamic updates to screen readers without moving focus. */
export function LiveRegion({ message, politeness = 'polite' }: Props) {
  if (!message) return null
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="rl-sr-only"
    >
      {message}
    </div>
  )
}
