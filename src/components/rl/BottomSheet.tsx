'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** id of the visible title element inside the sheet */
  titleId?: string
  closeLabel?: string
}

export function BottomSheet({
  open,
  onClose,
  children,
  titleId,
  closeLabel = 'Close details',
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnId = useId()

  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)

    const prev = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    if (dialog) {
      const focusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ;(focusable ?? dialog).focus()
    }

    return () => {
      window.removeEventListener('keydown', handler)
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ maxWidth: 430, margin: '0 auto', left: 0, right: 0 }}
    >
      <button
        type="button"
        className="absolute inset-0 rl-overlay-enter border-0 cursor-default"
        style={{ background: 'rgba(15, 23, 42, 0.28)' }}
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex flex-col bg-[var(--rl-surface)] rl-sheet-enter overflow-hidden"
        style={{
          height: '50dvh',
          minHeight: '50dvh',
          maxHeight: '50dvh',
          borderTopLeftRadius: 'var(--rl-radius-sheet)',
          borderTopRightRadius: 'var(--rl-radius-sheet)',
          boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={titleId ? undefined : undefined}
      >
        <button
          type="button"
          id={closeBtnId}
          className="rl-sheet-close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center" aria-hidden="true">
          <div
            className="rounded-full"
            style={{ width: 40, height: 4, background: 'var(--rl-border-strong)' }}
          />
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">{children}</div>
      </div>
    </div>
  )
}
