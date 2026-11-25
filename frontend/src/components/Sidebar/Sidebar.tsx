import { FlaskConical, Folder, Info, Layers, Search, Settings, type LucideIcon } from 'lucide-react'

import { StatusCard } from '../StatusCard/StatusCard'
import styles from './Sidebar.module.css'

interface NavItem {
  label: string
  icon: LucideIcon
  active?: boolean
}

const PRIMARY: NavItem[] = [
  { label: 'Library', icon: Folder, active: true },
  { label: 'Search', icon: Search },
  { label: 'Lab', icon: FlaskConical },
]

const SECONDARY: NavItem[] = [
  { label: 'Settings', icon: Settings },
  { label: 'About', icon: Info },
]

function NavLink({ label, icon: Icon, active }: NavItem) {
  if (active) {
    return (
      <a href="#" className={styles.link} aria-current="page">
        <Icon size={20} aria-hidden="true" />
        {label}
      </a>
    )
  }
  return (
    <a role="link" className={styles.link} aria-disabled="true" title="Coming soon">
      <Icon size={20} aria-hidden="true" />
      {label}
    </a>
  )
}

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Layers size={36} className={styles.logo} aria-hidden="true" />
        <div>
          <div className={styles.name}>LocalNest</div>
          <div className={styles.tagline}>Your local knowledge hub</div>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Main">
        {PRIMARY.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
        <hr className={styles.divider} />
        {SECONDARY.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>

      <StatusCard />
    </aside>
  )
}
