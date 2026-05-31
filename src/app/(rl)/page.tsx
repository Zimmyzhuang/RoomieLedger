import { prisma } from '@/lib/rl/db'
import { getGroupsList } from '@/lib/rl/getGroups'
import { GroupCard } from '@/components/rl/GroupCard'
import { EmptyState } from '@/components/rl/EmptyState'
import { SetupRequired } from '@/components/rl/SetupRequired'

export default async function GroupsPage() {
  const groupCount = await prisma.group.count()
  if (groupCount === 0) return <SetupRequired />

  const groups = await getGroupsList()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-shrink-0 rl-edge-bleed pt-2 pb-6" style={{ background: 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' }}>
        <p className="text-[11px] font-medium text-white/80">RoomieLedger</p>
        <p className="text-[11px] text-white/75 mt-1">Tap a group to see who owes who</p>
      </div>

      <div className="flex-1 pt-4 pb-4 flex flex-col gap-3">
        {groups.length === 0 ? (
          <EmptyState
            title="No groups yet"
            subtitle="Run npm run db:seed to load sample groups."
          />
        ) : (
          groups.map((g) => <GroupCard key={g.id} group={g} />)
        )}
      </div>
    </div>
  )
}
