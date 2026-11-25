import {
  ChevronDown,
  Folder,
  FolderSearch,
  LayoutGrid,
  List,
  LoaderCircle,
  Network,
  Play,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import styles from './SourceBar.module.css'

interface SourceBarProps {
  value: string
  onChange(value: string): void
  onScan(): void
  onRefresh(): void
  onBrowse(): void
  recent: string[]
  scanning: boolean
  canRefresh: boolean
}

export function SourceBar({
  value,
  onChange,
  onScan,
  onRefresh,
  onBrowse,
  recent,
  scanning,
  canRefresh,
}: SourceBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const comboRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const canScan = value.trim() !== '' && !scanning

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!comboRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (canScan) onScan()
  }

  const pick = (path: string) => {
    onChange(path)
    setMenuOpen(false)
  }

  const browse = () => {
    setMenuOpen(false)
    onBrowse()
  }

  const onComboKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault()
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
  }

  return (
    <form className={styles.card} onSubmit={submit}>
      <label className={styles.label} htmlFor="source-directory">
        Source directory
      </label>
      <div className={styles.row}>
        <div ref={comboRef} className={styles.combo} onKeyDown={onComboKeyDown}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={browse}
            aria-label="Browse folders"
            title="Browse folders"
          >
            <Folder size={20} aria-hidden="true" />
          </button>
          <input
            id="source-directory"
            className={styles.input}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type a folder path or browse…"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            ref={toggleRef}
            type="button"
            className={styles.iconButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Recent folders"
            aria-expanded={menuOpen}
            aria-controls="recent-folders"
          >
            <ChevronDown size={20} aria-hidden="true" />
          </button>
          {menuOpen && (
            <ul id="recent-folders" className={styles.menu} aria-label="Recent folders">
              {recent.length === 0 && <li className={styles.menuHint}>No recent folders</li>}
              {recent.map((path) => (
                <li key={path}>
                  <button type="button" className={styles.option} onClick={() => pick(path)}>
                    <Folder size={16} aria-hidden="true" />
                    {path}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className={styles.option} onClick={browse}>
                  <FolderSearch size={16} aria-hidden="true" />
                  Browse…
                </button>
              </li>
            </ul>
          )}
        </div>

        <button type="submit" className={styles.primary} disabled={!canScan}>
          {scanning ? (
            <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />
          ) : (
            <Play size={18} aria-hidden="true" />
          )}
          Scan
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={onRefresh}
          disabled={!canRefresh || scanning}
        >
          <RefreshCw size={18} aria-hidden="true" />
          Refresh
        </button>

        <div className={styles.views} role="group" aria-label="View">
          <button type="button" aria-label="List view" aria-disabled="true" title="Coming soon">
            <List size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Tree view"
            aria-pressed="true"
            className={styles.activeView}
          >
            <Network size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Grid view" aria-disabled="true" title="Coming soon">
            <LayoutGrid size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  )
}
