interface Props {
  title: string
  subtitle?: string
  titleId?: string
}

export function PageHeader({ title, subtitle, titleId = 'page-title' }: Props) {
  return (
    <header className="rl-page-header">
      <h1 id={titleId} className="rl-h1">
        {title}
      </h1>
      {subtitle ? <p className="rl-caption">{subtitle}</p> : null}
    </header>
  )
}
