import type { ReactNode } from 'react'

interface Props {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ id, label, hint, error, required, children }: Props) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="rl-field">
      <label htmlFor={id} className="rl-field-label">
        {label}
        {required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="rl-sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="rl-field-hint">
          {hint}
        </p>
      ) : null}
      <div className="rl-field-control" data-invalid={error ? true : undefined}>
        {children}
      </div>
      {error ? (
        <p id={errorId} className="rl-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Spread onto inputs/selects inside FormField for WCAG associations. */
export function fieldInputProps(
  id: string,
  opts: { hint?: string; error?: string; required?: boolean },
): {
  id: string
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
} {
  const hintId = opts.hint ? `${id}-hint` : undefined
  const errorId = opts.error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return {
    id,
    ...(opts.required ? { 'aria-required': true as const } : {}),
    ...(opts.error ? { 'aria-invalid': true as const } : {}),
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
  }
}
