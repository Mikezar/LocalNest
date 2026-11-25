import { useQueryClient } from '@tanstack/react-query'
import { FolderOpen, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DetailsPane } from '../components/DetailsPane/DetailsPane'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { FolderPickerDialog } from '../components/FolderPickerDialog/FolderPickerDialog'
import { ErrorCard } from '../components/ErrorCard/ErrorCard'
import { PageHeader, type LibraryStats } from '../components/PageHeader/PageHeader'
import { SearchBox } from '../components/SearchBox/SearchBox'
import { SourceBar } from '../components/SourceBar/SourceBar'
import { TreeView } from '../components/TreeView/TreeView'
import { useRecentFolders } from '../hooks/useRecentFolders'
import { useScan } from '../hooks/useScan'
import { filterTree } from '../lib/search'
import {
  buildRoot,
  countDocuments,
  countFolders,
  findNode,
  totalSize,
  type TreeNode,
} from '../lib/tree'
import styles from './LibraryPage.module.css'

const NO_STATS: LibraryStats = { documents: null, folders: null, totalSize: null }

export function LibraryPage() {
  const [chosenPath, setChosenPath] = useState('')
  const [scannedPath, setScannedPath] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { recent, add } = useRecentFolders()
  const scan = useScan(scannedPath)

  const root: TreeNode | null = useMemo(
    () => (scannedPath && scan.data ? buildRoot(scannedPath, scan.data) : null),
    [scannedPath, scan.data],
  )

  // Look the selection up in the latest scan so Refresh never shows stale details.
  const selected = useMemo(
    () => (root && selectedPath ? findNode(root, selectedPath) : null),
    [root, selectedPath],
  )

  const [query, setQuery] = useState('')
  const searching = query.trim() !== ''
  const filtered = useMemo(() => (root ? filterTree(root, query) : null), [root, query])

  const stats: LibraryStats = root
    ? { documents: countDocuments(root), folders: countFolders(root), totalSize: totalSize(root) }
    : NO_STATS

  useEffect(() => {
    if (scannedPath && scan.isSuccess) add(scannedPath)
  }, [scannedPath, scan.isSuccess, add])

  const startScan = () => {
    const path = chosenPath.trim()
    if (path === scannedPath) void scan.refetch()
    else {
      // A folder scanned earlier is still cached; Scan must always hit the disk again.
      queryClient.removeQueries({ queryKey: ['scan', path] })
      setScannedPath(path)
      setSelectedPath(null)
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader stats={stats} />
      <SourceBar
        value={chosenPath}
        onChange={setChosenPath}
        onScan={startScan}
        onRefresh={() => void scan.refetch()}
        onBrowse={() => setPickerOpen(true)}
        recent={recent}
        scanning={scan.isFetching}
        canRefresh={scannedPath !== null}
      />
      <div className={styles.panes}>
        <section className={styles.pane} aria-label="Library tree">
          {scannedPath === null ? (
            <EmptyState icon={FolderOpen} message="Choose a source directory and press Scan" />
          ) : scan.isError ? (
            <ErrorCard message={scan.error.message} onRetry={() => void scan.refetch()} />
          ) : scan.isPending ? (
            <EmptyState icon={FolderOpen} message="Scanning…" />
          ) : root ? (
            <>
              <SearchBox
                value={query}
                onChange={setQuery}
                matches={searching ? (filtered?.matches ?? 0) : null}
              />
              {searching && !filtered ? (
                <EmptyState
                  icon={SearchX}
                  message={`No files or folders match “${query.trim()}”`}
                />
              ) : (
                <TreeView
                  // Remount per search so the matching folders open fresh.
                  key={`${root.path}|${query.trim()}`}
                  root={filtered?.root ?? root}
                  summarySource={root}
                  initialExpanded={filtered?.expanded}
                  query={query}
                  selectedPath={selected?.path ?? null}
                  onSelect={(node) => setSelectedPath(node.path)}
                />
              )}
            </>
          ) : null}
        </section>
        <section className={styles.pane} aria-label="Details">
          <DetailsPane node={selected} onClose={() => setSelectedPath(null)} />
        </section>
      </div>
      <FolderPickerDialog
        open={pickerOpen}
        initialPath={chosenPath.trim() || scannedPath}
        onSelect={(path) => {
          setChosenPath(path)
          setPickerOpen(false)
        }}
        onCancel={() => setPickerOpen(false)}
      />
    </div>
  )
}
