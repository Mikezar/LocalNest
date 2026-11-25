import { ChevronRight, Folder, HardDrive, LoaderCircle, Monitor } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'

import { useBrowse } from '../../hooks/useBrowse'
import { breadcrumbs } from '../../lib/paths'
import { ErrorCard } from '../ErrorCard/ErrorCard'
import styles from './FolderPickerDialog.module.css'

interface FolderPickerDialogProps {
  open: boolean
  initialPath: string | null
  onSelect(path: string): void
  onCancel(): void
}

export function FolderPickerDialog(props: FolderPickerDialogProps) {
  if (!props.open) return null
  return <PickerContent {...props} />
}

function PickerContent({ initialPath, onSelect, onCancel }: FolderPickerDialogProps) {
  const [path, setPath] = useState<string | null>(initialPath)
  const listing = useBrowse(path)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Move focus into the dialog on open and give it back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    return () => opener?.focus()
  }, [])

  // Navigating removes the clicked entry; keep focus inside the dialog.
  useEffect(() => {
    if (!dialogRef.current?.contains(document.activeElement)) dialogRef.current?.focus()
  }, [path, listing.status])

  const trapTab = (event: ReactKeyboardEvent) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)')]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  const crumbs = path === null ? [] : breadcrumbs(path)
  const atRoots = path === null

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        onKeyDown={trapTab}
        aria-modal="true"
        aria-labelledby="picker-title"
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="picker-title" className={styles.title}>
          Choose folder
        </h2>

        <nav aria-label="Folder path" className={styles.crumbs}>
          {atRoots ? (
            <span aria-current="location" className={styles.current}>
              <Monitor size={16} aria-hidden="true" />
              This PC
            </span>
          ) : (
            <button type="button" className={styles.crumb} onClick={() => setPath(null)}>
              <Monitor size={16} aria-hidden="true" />
              This PC
            </button>
          )}
          {crumbs.map((crumb, i) => (
            <span key={crumb.path} className={styles.crumbItem}>
              <ChevronRight size={14} className={styles.separator} aria-hidden="true" />
              {i === crumbs.length - 1 ? (
                <span aria-current="location" className={styles.current}>
                  {crumb.label}
                </span>
              ) : (
                <button type="button" className={styles.crumb} onClick={() => setPath(crumb.path)}>
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>

        <div className={styles.list}>
          {listing.isPending ? (
            <div className={styles.hint}>
              <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />
              Loading…
            </div>
          ) : listing.isError ? (
            <ErrorCard message={listing.error.message} onRetry={() => void listing.refetch()} />
          ) : listing.data.entries.length === 0 ? (
            <div className={styles.hint}>No subfolders</div>
          ) : (
            listing.data.entries.map((entry) => (
              <button
                key={entry.path}
                type="button"
                className={styles.entry}
                data-kind={entry.kind ?? 'folder'}
                onClick={() => setPath(entry.path)}
              >
                {entry.kind === 'drive' ? (
                  <HardDrive size={18} aria-hidden="true" />
                ) : (
                  <Folder size={18} color="var(--folder)" aria-hidden="true" />
                )}
                {entry.name}
              </button>
            ))
          )}
        </div>

        <footer className={styles.footer}>
          <span className={styles.selection} title={path ?? undefined}>
            {path ?? 'Choose a drive'}
          </span>
          <button type="button" className={styles.secondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={atRoots}
            onClick={() => path && onSelect(path)}
          >
            Select
          </button>
        </footer>
      </div>
    </div>
  )
}
