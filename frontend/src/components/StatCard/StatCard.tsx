import type { LucideIcon } from 'lucide-react'

import styles from './StatCard.module.css'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  tone?: 'default' | 'folder'
}

export function StatCard({ icon: Icon, label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className={styles.card} data-testid={`stat-${label}`}>
      <Icon size={28} className={styles.icon} data-tone={tone} aria-hidden="true" />
      <div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  )
}
