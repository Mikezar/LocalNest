import { useHealth } from '../../hooks/useHealth'
import styles from './StatusCard.module.css'

export function StatusCard() {
  const health = useHealth()

  const state = health.isSuccess ? 'connected' : health.isError ? 'unreachable' : 'checking'
  const label = {
    connected: 'Backend: connected',
    unreachable: 'Backend: unreachable',
    checking: 'Backend: checking…',
  }[state]

  return (
    <div className={styles.card} role="status">
      <div className={styles.title}>
        <span className={styles.dot} data-state={state} aria-hidden="true" />
        Local workspace
      </div>
      <div className={styles.backend}>{label}</div>
      {health.data && <div className={styles.version}>v{health.data.version}</div>}
    </div>
  )
}
