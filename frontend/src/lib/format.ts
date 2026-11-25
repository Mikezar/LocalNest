import type { FileSystemNode } from '../api/types'

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const
const DASH = '—'

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })
const numberFormat = new Intl.NumberFormat('en-US')

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return DASH

  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  const digits = unit >= 2 ? 1 : 0
  return `${value.toFixed(digits)} ${UNITS[unit]}`
}

export function formatBytesExact(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return DASH
  return `${formatBytes(bytes)} (${numberFormat.format(bytes)} bytes)`
}

export function formatDate(iso: string | null): string {
  if (!iso) return DASH
  return dateFormat.format(new Date(iso))
}

export function extensionOf(node: Pick<FileSystemNode, 'kind' | 'name' | 'extension'>): string {
  if (node.kind === 'folder') return ''
  if (node.extension) return node.extension.toLowerCase()
  const dot = node.name.lastIndexOf('.')
  return dot > 0 ? node.name.slice(dot).toLowerCase() : ''
}

const TYPE_LABELS: Record<string, string> = {
  '.pdf': 'PDF Document',
  '.md': 'Markdown Document',
  '.txt': 'Text Document',
  '.docx': 'Word Document',
}

export function documentTypeLabel(extension: string): string {
  return TYPE_LABELS[extension] ?? 'Document'
}
