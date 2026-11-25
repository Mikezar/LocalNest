import { CircleAlert, RotateCw } from 'lucide-react'

import styles from './ErrorCard.module.css'

interface ErrorCardProps {
  message: string
  onRetry?: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className={styles.card} role="alert">
      <CircleAlert size={20} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          <RotateCw size={14} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  )
}
