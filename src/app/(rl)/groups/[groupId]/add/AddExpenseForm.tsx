'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryIcon } from '@/components/rl/CategoryIcon'
import { FormField, fieldInputProps } from '@/components/rl/FormField'
import { LiveRegion } from '@/components/rl/LiveRegion'
import { PageHeader } from '@/components/rl/PageHeader'
import type { RoommateDTO, Category, CreateExpenseBody } from '@/types/rl'

const CATEGORIES: Category[] = ['groceries', 'utilities', 'food', 'rent', 'internet', 'other']

interface Props {
  roommates: RoommateDTO[]
  myId: string
  groupId: string
}

type FieldErrors = {
  form?: string
  title?: string
  amount?: string
  split?: string
}

export function AddExpenseForm({ roommates, myId, groupId }: Props) {
  const router = useRouter()
  const formId = useId()
  const amountId = `${formId}-amount`
  const titleId = `${formId}-title`
  const paidById = `${formId}-paid-by`

  const [title, setTitle] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<Category>('groceries')
  const [paidBy, setPaidBy] = useState(myId)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(roommates.map((r) => r.id)))
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [statusMessage, setStatusMessage] = useState('')

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100)
  const participantCount = checkedIds.size
  const sharePerPerson = participantCount > 0 ? Math.round(amountCents / participantCount) : 0

  function toggleRoommate(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setErrors((e) => ({ ...e, split: undefined }))
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!title.trim()) {
      next.title = 'Enter a short title so everyone recognizes this expense (for example, "Groceries").'
    }
    if (!amountStr.trim() || amountCents <= 0) {
      next.amount = 'Enter an amount greater than zero, using dollars and cents (for example, 42.50).'
    }
    if (checkedIds.size === 0) {
      next.split = 'Select at least one roommate to include in the split.'
    }
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      setStatusMessage('Please fix the highlighted fields before saving.')
      return
    }

    setSubmitting(true)
    setErrors({})
    setStatusMessage('Saving expense…')

    const body: CreateExpenseBody = {
      groupId,
      title: title.trim(),
      amountCents,
      category,
      paidById: paidBy,
      participantIds: Array.from(checkedIds),
    }

    try {
      const res = await fetch('/api/rl/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        setErrors({
          form: 'We could not save this expense. Check your connection and try again.',
        })
        setStatusMessage('')
        setSubmitting(false)
        return
      }

      setStatusMessage('Expense added successfully.')
      router.push(`/?g=${groupId}`)
      router.refresh()
    } catch {
      setErrors({
        form: 'We could not reach the server. Check your connection and try again.',
      })
      setStatusMessage('')
      setSubmitting(false)
    }
  }

  return (
    <form className="rl-page flex-1 overflow-y-auto" onSubmit={handleSubmit} noValidate>
      <PageHeader
        titleId="add-expense-title"
        title="Add expense"
        subtitle="Split fairly with your group"
      />

      <LiveRegion message={statusMessage} politeness="assertive" />

      {errors.form ? (
        <p className="rl-field-error" role="alert">
          {errors.form}
        </p>
      ) : null}

      <FormField
        id={amountId}
        label="Amount"
        hint="Enter the total in US dollars."
        error={errors.amount}
        required
      >
        <div className="rl-amount-entry">
          <span className="rl-amount-entry-symbol" aria-hidden="true">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value)
              setErrors((err) => ({ ...err, amount: undefined }))
            }}
            className="rl-input rl-amount-entry-input"
            {...fieldInputProps(amountId, { hint: 'Enter the total in US dollars.', error: errors.amount, required: true })}
          />
        </div>
      </FormField>

      <FormField
        id={titleId}
        label="Title"
        hint="A short name everyone will recognize."
        error={errors.title}
        required
      >
        <input
          type="text"
          placeholder="e.g. Trader Joe's run"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setErrors((err) => ({ ...err, title: undefined }))
          }}
          className="rl-input"
          {...fieldInputProps(titleId, {
            hint: 'A short name everyone will recognize.',
            error: errors.title,
            required: true,
          })}
        />
      </FormField>

      <FormField id={paidById} label="Paid by" required>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="rl-input"
          {...fieldInputProps(paidById, { required: true })}
        >
          {roommates.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
              {r.id === myId ? ' (You)' : ''}
            </option>
          ))}
        </select>
      </FormField>

      <fieldset className="rl-field">
        <legend className="rl-legend">Category</legend>
        <p className="rl-field-hint">Choose the type of expense.</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Expense category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rl-pill capitalize flex items-center gap-1.5 ${cat === category ? 'rl-pill-active' : ''}`}
              aria-pressed={cat === category}
            >
              <CategoryIcon category={cat} compact />
              {cat}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rl-field">
        <legend className="rl-legend">Split with</legend>
        <p className="rl-field-hint" id={`${formId}-split-hint`}>
          Equal split
          {sharePerPerson > 0
            ? ` · ${(sharePerPerson / 100).toFixed(2)} dollars per person`
            : ' · select roommates below'}
        </p>
        {errors.split ? (
          <p className="rl-field-error" role="alert" id={`${formId}-split-error`}>
            {errors.split}
          </p>
        ) : null}
        <div className="rl-field-control" style={{ padding: 0 }}>
          <ul className="flex flex-col" aria-describedby={`${formId}-split-hint`}>
            {roommates.map((r, i) => {
              const checked = checkedIds.has(r.id)
              const name = `${r.name}${r.id === myId ? ' (you)' : ''}`
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => toggleRoommate(r.id)}
                    className="rl-list-row w-full text-left border-0 bg-transparent cursor-pointer"
                    style={{
                      boxShadow: i > 0 ? 'inset 0 1px 0 var(--rl-border)' : undefined,
                      minHeight: 'var(--rl-touch-min)',
                    }}
                    aria-pressed={checked}
                    aria-label={`${name}, ${checked ? 'included' : 'not included'} in split${
                      checked && sharePerPerson > 0
                        ? `, share ${(sharePerPerson / 100).toFixed(2)} dollars`
                        : ''
                    }`}
                  >
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: checked ? 'var(--rl-accent)' : 'var(--rl-surface)',
                        border: checked ? 'none' : '2px solid var(--rl-border-strong)',
                      }}
                      aria-hidden="true"
                    >
                      {checked && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <div className="rl-avatar rl-avatar-sm" aria-hidden="true" style={{ background: r.color }}>
                      {r.name[0]}
                    </div>
                    <span className="rl-body font-medium flex-1">{name}</span>
                    <span className="rl-amount" style={{ color: checked ? 'var(--rl-accent-hover)' : 'var(--rl-ink-muted)' }}>
                      {checked && sharePerPerson > 0 ? `$${(sharePerPerson / 100).toFixed(2)}` : '—'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="rl-btn rl-btn-primary disabled:opacity-60"
        aria-busy={submitting}
      >
        {submitting ? (
          <span className="rl-loading">
            <span aria-hidden="true">…</span>
            Saving expense
          </span>
        ) : (
          'Add expense'
        )}
      </button>
    </form>
  )
}
