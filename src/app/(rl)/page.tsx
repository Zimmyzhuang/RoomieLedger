import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/rl/db'
import { getGroupsList } from '@/lib/rl/getGroups'
import { getGroupDashboard } from '@/lib/rl/getGroupDashboard'
import { MyGroups } from '@/components/rl/MyGroups'
import { SetupRequired } from '@/components/rl/SetupRequired'

interface Props {
  searchParams: Promise<{ g?: string }>
}

export default async function MyGroupsPage({ searchParams }: Props) {
  const { g } = await searchParams
  const groupCount = await prisma.group.count()
  if (groupCount === 0) return <SetupRequired />

  const groups = await getGroupsList()
  if (!g && groups[0]) redirect(`/?g=${groups[0].id}`)

  const activeGroupId = g && groups.some((x) => x.id === g) ? g : groups[0].id
  const dashboard = await getGroupDashboard(activeGroupId)
  if (!dashboard) return <SetupRequired />

  return (
    <Suspense fallback={<div className="flex-1 p-4 text-[var(--rl-ink-muted)] text-sm">Loading…</div>}>
      <MyGroups groups={groups} activeGroupId={activeGroupId} dashboard={dashboard} />
    </Suspense>
  )
}
