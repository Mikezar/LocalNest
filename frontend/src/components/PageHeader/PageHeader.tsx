import { FileText, Folder, FolderOpen, Layers } from 'lucide-react'

import { formatBytes } from '../../lib/format'
import { StatCard } from '../StatCard/StatCard'
import styles from './PageHeader.module.css'

export interface LibraryStats {
  documents: number | null
  folders: number | null
  totalSize: number | null
}

const show = (value: number | null) => (value === null ? '—' : String(value))

export function PageHeader({ stats }: { stats: LibraryStats }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <FolderOpen size={40} className={styles.titleIcon} aria-hidden="true" />
        <div>
          <h1 className={styles.title}>Library Explorer</h1>
          <p className={styles.subtitle}>Browse and explore your local documents</p>
        </div>
      </div>
      <div className={styles.stats}>
        <StatCard icon={FileText} label="Documents" value={show(stats.documents)} />
        <StatCard icon={Folder} label="Folders" value={show(stats.folders)} tone="folder" />
        <StatCard icon={Layers} label="Total size" value={formatBytes(stats.totalSize)} />
      </div>
    </header>
  )
}
