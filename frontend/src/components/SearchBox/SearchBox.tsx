import { Search, X } from 'lucide-react'

import styles from './SearchBox.module.css'

interface SearchBoxProps {
  value: string
  onChange(value: string): void
  /** Number of matches, or null when no search is active. */
  matches: number | null
}

export function SearchBox({ value, onChange, matches }: SearchBoxProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.field}>
        <Search size={16} className={styles.icon} aria-hidden="true" />
        <input
          type="search"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onChange('')
          }}
          placeholder="Search files and folders"
          aria-label="Search files and folders"
          spellCheck={false}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {matches !== null && (
        <span className={styles.count} role="status">
          {matches === 1 ? '1 match' : `${matches} matches`}
        </span>
      )}
    </div>
  )
}
