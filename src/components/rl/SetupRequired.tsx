import { EmptyState } from '@/components/rl/EmptyState'

export function SetupRequired() {
  return (
    <div role="alert">
      <EmptyState
        title="Database not set up"
        subtitle="From the project folder, run npm run db:setup, restart the dev server with npm run dev, then refresh this page."
      />
    </div>
  )
}
