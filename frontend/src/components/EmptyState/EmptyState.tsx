import type { LucideIcon } from 'lucide-react'

import styles from './EmptyState.module.css'

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className={styles.empty}>
      <Icon size={36} aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
