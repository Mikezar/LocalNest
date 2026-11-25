import { ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { formatBytes } from '../../lib/format'
import { matchRange } from '../../lib/search'
import { flattenVisible, summarizeFolders, type TreeNode } from '../../lib/tree'
import { FileIcon } from '../FileIcon/FileIcon'
import styles from './TreeView.module.css'

interface TreeViewProps {
  root: TreeNode
  selectedPath: string | null
  onSelect(node: TreeNode): void
  /** Text to highlight in names. */
  query?: string
  /** Folders open on first render; defaults to just the root. */
  initialExpanded?: ReadonlySet<string>
  /** Tree to compute folder totals from, so a filtered tree still shows full sizes. */
  summarySource?: TreeNode
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const range = matchRange(text, query)
  if (!range) return <>{text}</>
  const [start, end] = range
  return (
    <>
      {text.slice(0, start)}
      <mark className={styles.match}>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

const INDENT_PX = 20

export function TreeView({
  root,
  selectedPath,
  onSelect,
  query = '',
  initialExpanded,
  summarySource = root,
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => initialExpanded ?? new Set([root.path]),
  )
  const [focusedPath, setFocusedPath] = useState(root.path)
  const containerRef = useRef<HTMLDivElement>(null)

  const summaries = useMemo(() => summarizeFolders(summarySource), [summarySource])
  const rows = useMemo(() => flattenVisible(root, expanded), [root, expanded])

  const setOpen = (path: string, open: boolean) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (open) next.add(path)
      else next.delete(path)
      return next
    })

  const focusRow = (index: number) => {
    const target = rows[index]
    if (!target) return
    setFocusedPath(target.node.path)
    containerRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]')[index]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const { node, depth } = rows[index]
    const isFolder = node.kind === 'folder'
    const isOpen = expanded.has(node.path)

    switch (event.key) {
      case 'ArrowDown':
        focusRow(index + 1)
        break
      case 'ArrowUp':
        focusRow(index - 1)
        break
      case 'ArrowRight':
        if (isFolder && !isOpen) setOpen(node.path, true)
        else if (isFolder) focusRow(index + 1)
        break
      case 'ArrowLeft':
        if (isFolder && isOpen) setOpen(node.path, false)
        else {
          const parent = rows.findLastIndex((r, i) => i < index && r.depth === depth - 1)
          if (parent >= 0) focusRow(parent)
        }
        break
      case 'Enter':
      case ' ':
        onSelect(node)
        break
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <div ref={containerRef} role="tree" aria-label="Library" className={styles.tree}>
      {rows.map(({ node, depth }, index) => {
        const isFolder = node.kind === 'folder'
        const isOpen = expanded.has(node.path)
        const summary = isFolder ? summaries.get(node.path) : undefined
        const isEmpty = summary?.documents === 0

        const meta = summary
          ? summary.documents === 0
            ? '0 items'
            : `${summary.documents} items · ${formatBytes(summary.size)}`
          : formatBytes(node.size_bytes)

        return (
          <div
            key={node.path}
            role="treeitem"
            aria-level={depth + 1}
            aria-selected={node.path === selectedPath}
            aria-expanded={isFolder ? isOpen : undefined}
            data-empty={isEmpty ? 'true' : undefined}
            data-kind={node.kind}
            tabIndex={node.path === focusedPath ? 0 : -1}
            className={styles.row}
            style={{ paddingLeft: 12 + depth * INDENT_PX }}
            onClick={() => {
              setFocusedPath(node.path)
              onSelect(node)
              if (isFolder) setOpen(node.path, !isOpen)
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {isFolder ? (
              <button
                type="button"
                tabIndex={-1}
                className={styles.chevron}
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  setOpen(node.path, !isOpen)
                }}
              >
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            ) : (
              <span className={styles.chevronSpacer} />
            )}
            <FileIcon node={node} />
            <span className={styles.name}>
              <Highlighted text={node.name} query={query} />
            </span>
            <span className={styles.meta}>{meta}</span>
          </div>
        )
      })}
    </div>
  )
}
