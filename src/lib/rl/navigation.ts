export interface NavAction {
  href: string
  label: string
}

export interface MobileNavState {
  title: string
  back: NavAction | null
  forward: NavAction | null
  /** Teal bar on groups / owes screens */
  variant: 'light' | 'teal'
}

const GROUP_SECTIONS = ['home', 'ledger', 'balances', 'roommates'] as const
type GroupSection = (typeof GROUP_SECTIONS)[number]

const SECTION_LABELS: Record<GroupSection, string> = {
  home: 'Home',
  ledger: 'Ledger',
  balances: 'Balances',
  roommates: 'People',
}

function parseGroupPath(pathname: string): { groupId: string; section: string | null } | null {
  const match = pathname.match(/^\/groups\/([^/]+)(?:\/([^/]+))?\/?$/)
  if (!match) return null
  return { groupId: match[1], section: match[2] ?? null }
}

function isGroupSection(s: string | null): s is GroupSection {
  return s !== null && (GROUP_SECTIONS as readonly string[]).includes(s)
}

export function getMobileNavState(pathname: string): MobileNavState | null {
  if (pathname === '/') {
    return {
      title: 'Your groups',
      back: null,
      forward: null,
      variant: 'teal',
    }
  }

  const group = parseGroupPath(pathname)
  if (!group) return null

  const base = `/groups/${group.groupId}`

  if (group.section === null) {
    return {
      title: 'Who owes who',
      back: { href: '/', label: 'Groups' },
      forward: { href: `${base}/home`, label: 'Dashboard' },
      variant: 'teal',
    }
  }

  if (group.section === 'add') {
    return {
      title: 'Add expense',
      back: { href: `${base}/home`, label: 'Home' },
      forward: null,
      variant: 'light',
    }
  }

  if (!isGroupSection(group.section)) return null

  const idx = GROUP_SECTIONS.indexOf(group.section)

  const back: NavAction | null =
    idx === 0
      ? { href: base, label: 'Who owes' }
      : { href: `${base}/${GROUP_SECTIONS[idx - 1]}`, label: SECTION_LABELS[GROUP_SECTIONS[idx - 1]] }

  const forward: NavAction | null =
    idx === GROUP_SECTIONS.length - 1
      ? { href: base, label: 'Who owes' }
      : { href: `${base}/${GROUP_SECTIONS[idx + 1]}`, label: SECTION_LABELS[GROUP_SECTIONS[idx + 1]] }

  return {
    title: SECTION_LABELS[group.section],
    back,
    forward,
    variant: 'light',
  }
}
