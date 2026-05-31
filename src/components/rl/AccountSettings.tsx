'use client'

const ROWS = [
  { id: 'edit', label: 'Edit profile', sublabel: 'Name, email, photo' },
  { id: 'notifications', label: 'Notifications', sublabel: 'Expense and settlement alerts' },
  { id: 'privacy', label: 'Privacy', sublabel: 'Who can see your activity' },
  { id: 'help', label: 'Help and support', sublabel: 'FAQs and contact' },
] as const

export function AccountSettings() {
  function handleAction(id: string) {
    if (id === 'signout') {
      window.alert('Demo mode — sign-in is not connected yet. Your data stays on this device.')
      return
    }
    window.alert('Coming soon in a future update.')
  }

  return (
    <section className="rl-section" aria-labelledby="account-settings-heading">
      <h2 id="account-settings-heading" className="rl-h2">
        Settings
      </h2>
      <ul className="rl-menu">
        {ROWS.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => handleAction(row.id)}
              className="rl-menu-item"
              aria-label={`${row.label}. ${row.sublabel}`}
            >
              <div className="rl-text-stack">
                <span className="rl-body font-semibold">{row.label}</span>
                <span className="rl-caption">{row.sublabel}</span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--rl-ink-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width={16}
                height={16}
                className="flex-shrink-0"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => handleAction('signout')}
        className="rl-btn rl-btn-secondary w-full rl-amount-negative"
        aria-label="Sign out of demo account"
      >
        Sign out
      </button>

      <p className="rl-caption text-center px-4 pb-2">
        Demo account · No password required for this preview
      </p>
    </section>
  )
}
