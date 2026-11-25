import {
  Calendar,
  Copy,
  Ellipsis,
  FileText,
  FolderOpen,
  Hash,
  Info,
  Layers,
  MousePointerClick,
  Tag,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { documentTypeLabel, extensionOf, formatBytesExact, formatDate } from '../../lib/format'
import { countDocuments, totalSize, type TreeNode } from '../../lib/tree'
import { EmptyState } from '../EmptyState/EmptyState'
import { FileIcon } from '../FileIcon/FileIcon'
import styles from './DetailsPane.module.css'

interface DetailsPaneProps {
  node: TreeNode | null
  onClose(): void
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>
        <Icon size={18} className={styles.fieldIcon} aria-hidden="true" />
        {children}
      </dd>
    </>
  )
}

export function DetailsPane({ node, onClose }: DetailsPaneProps) {
  if (!node) {
    return <EmptyState icon={MousePointerClick} message="Select a file or folder to see details" />
  }

  const isFolder = node.kind === 'folder'
  const extension = extensionOf(node)

  return (
    <div className={styles.pane}>
      <header className={styles.header}>
        <FileIcon node={node} size={44} />
        <div className={styles.heading}>
          <h2 className={styles.name}>{node.name}</h2>
          <div className={styles.kind}>{isFolder ? 'Folder' : 'Document'}</div>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close details">
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div role="tablist" className={styles.tabs}>
        <button type="button" role="tab" aria-selected="true" className={styles.tab}>
          <Info size={18} aria-hidden="true" />
          Details
        </button>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          aria-disabled="true"
          title="Coming soon"
          className={styles.tab}
        >
          <FileText size={18} aria-hidden="true" />
          Preview
        </button>
      </div>

      <dl className={styles.fields}>
        <Field icon={FolderOpen} label="Path">
          <span className={styles.path}>{node.path}</span>
          <button
            type="button"
            className={styles.copy}
            onClick={() => void navigator.clipboard.writeText(node.path).catch(() => {})}
            aria-label="Copy path"
            title="Copy path"
          >
            <Copy size={16} aria-hidden="true" />
          </button>
        </Field>
        {isFolder ? (
          <>
            <Field icon={Hash} label="Items">
              {countDocuments(node)}
            </Field>
            <Field icon={Layers} label="Size">
              {formatBytesExact(totalSize(node))}
            </Field>
          </>
        ) : (
          <>
            <Field icon={Layers} label="Size">
              {formatBytesExact(node.size_bytes)}
            </Field>
            <Field icon={Tag} label="Extension">
              {extension || '—'}
            </Field>
          </>
        )}
        <Field icon={Calendar} label="Modified">
          {formatDate(node.modified_at)}
        </Field>
        {!isFolder && (
          <Field icon={FileText} label="Type">
            {documentTypeLabel(extension)}
          </Field>
        )}
      </dl>

      {!isFolder && (
        <>
          <div className={styles.indexing}>
            <span className={styles.label}>Indexing status</span>
            <span className={styles.pill}>
              <span className={styles.pillDot} aria-hidden="true" />
              Not indexed
            </span>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.index} aria-disabled="true" title="Coming soon">
              <Layers size={18} aria-hidden="true" />
              Add to Index
            </button>
            <button
              type="button"
              className={styles.more}
              aria-label="More actions"
              aria-disabled="true"
              title="Coming soon"
            >
              <Ellipsis size={18} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
