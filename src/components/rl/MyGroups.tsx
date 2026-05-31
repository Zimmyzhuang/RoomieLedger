'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { GroupRow } from '@/components/rl/GroupRow'
import { GroupDashboardPanel } from '@/components/rl/GroupDashboardPanel'
import { EmptyState } from '@/components/rl/EmptyState'
import { PageHeader } from '@/components/rl/PageHeader'
import type { GroupDTO } from '@/types/rl'
import type { GroupDashboardData } from '@/lib/rl/getGroupDashboard'

interface Props {
  groups: GroupDTO[]
  activeGroupId: string
  dashboard: GroupDashboardData
}

export function MyGroups({ groups, activeGroupId, dashboard }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function selectGroup(id: string) {
    const next = new URLSearchParams(searchParams.toString())
    next.set('g', id)
    router.push(`/?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="rl-page flex-1">
      <PageHeader
        title="Your groups"
        subtitle="Select a group to see balances and activity"
      />

      <section className="rl-section">
        {groups.length === 0 ? (
          <EmptyState
            title="No groups yet"
            subtitle="Run npm run db:seed to load sample groups."
          />
        ) : (
          <ul className="rl-list" aria-label="Your groups">
            {groups.map((g) => (
              <li key={g.id}>
                <GroupRow
                  group={g}
                  selected={g.id === activeGroupId}
                  onSelect={() => selectGroup(g.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {groups.length > 0 && <GroupDashboardPanel dashboard={dashboard} />}
    </div>
  )
}
