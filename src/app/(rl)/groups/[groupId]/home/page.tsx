import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function LegacyGroupHomePage({ params }: Props) {
  const { groupId } = await params
  redirect(`/?g=${groupId}`)
}
