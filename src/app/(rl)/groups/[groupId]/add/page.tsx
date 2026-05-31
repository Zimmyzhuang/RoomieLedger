import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { SetupRequired } from '@/components/rl/SetupRequired'
import { AddExpenseForm } from './AddExpenseForm'
interface Props {
  params: Promise<{ groupId: string }>
}

export default async function AddExpensePage({ params }: Props) {
  const { groupId } = await params

  const [me, roommates] = await Promise.all([
    getMe(groupId),
    prisma.roommate.findMany({ where: { groupId }, orderBy: { name: 'asc' } }),
  ])

  if (!me) return <SetupRequired />

  const dtos = roommates.map((r) => ({
    id: r.id,
    name: r.name,
    handle: r.handle,
    color: r.color,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AddExpenseForm roommates={dtos} myId={me.id} groupId={groupId} />
    </div>
  )
}
