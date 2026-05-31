'use client'

import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div
        className="absolute inset-0 bg-slate-900/40 rl-overlay-enter"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-t-[22px] rl-sheet-enter"
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}
      >
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mt-[10px] mb-[14px]" />
        {children}
      </div>
    </div>
  )
}
