import { EmptyState } from '@/components/rl/EmptyState'

export function SetupRequired() {
  return (
    <EmptyState
      title="Database not set up"
      subtitle="From the project folder run npm run db:setup, restart npm run dev, then refresh."
    />
  )
}
