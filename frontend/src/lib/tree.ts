import type { FileSystemNode } from '../api/types'

/** A node in the displayed tree. The scanned root has no known modified time. */
export type TreeNode = Omit<FileSystemNode, 'modified_at' | 'children'> & {
  modified_at: string | null
  children?: TreeNode[] | null
}

export interface VisibleRow {
  node: TreeNode
  depth: number
}

export function buildRoot(path: string, children: FileSystemNode[]): TreeNode {
  const segments = path.split(/[/\\]/).filter(Boolean)
  const isDriveRoot = segments.length <= 1
  return {
    path,
    name: isDriveRoot ? path : segments[segments.length - 1],
    kind: 'folder',
    modified_at: null,
    children,
  }
}

function sum(node: TreeNode, pick: (child: TreeNode) => number): number {
  return (node.children ?? []).reduce((total, child) => total + pick(child), 0)
}

export function countDocuments(node: TreeNode): number {
  if (node.kind === 'file') return 1
  return sum(node, countDocuments)
}

export function countFolders(node: TreeNode): number {
  return sum(node, (child) => (child.kind === 'folder' ? 1 + countFolders(child) : 0))
}

export function totalSize(node: TreeNode): number | null {
  if (node.kind === 'file') return node.size_bytes ?? null

  let total: number | null = null
  for (const child of node.children ?? []) {
    const size = totalSize(child)
    if (size !== null) total = (total ?? 0) + size
  }
  return total
}

export function hasDocuments(node: TreeNode): boolean {
  if (node.kind === 'file') return true
  return (node.children ?? []).some(hasDocuments)
}

export function flattenVisible(root: TreeNode, expanded: ReadonlySet<string>): VisibleRow[] {
  const rows: VisibleRow[] = []
  const visit = (node: TreeNode, depth: number) => {
    rows.push({ node, depth })
    if (node.kind === 'folder' && expanded.has(node.path)) {
      for (const child of node.children ?? []) visit(child, depth + 1)
    }
  }
  visit(root, 0)
  return rows
}

export interface FolderSummary {
  documents: number
  size: number | null
}

/** Document count and total size for every folder, computed in a single walk. */
export function summarizeFolders(root: TreeNode): Map<string, FolderSummary> {
  const summaries = new Map<string, FolderSummary>()

  const visit = (node: TreeNode): FolderSummary => {
    if (node.kind === 'file') return { documents: 1, size: node.size_bytes ?? null }

    const summary: FolderSummary = { documents: 0, size: null }
    for (const child of node.children ?? []) {
      const childSummary = visit(child)
      summary.documents += childSummary.documents
      if (childSummary.size !== null) summary.size = (summary.size ?? 0) + childSummary.size
    }
    summaries.set(node.path, summary)
    return summary
  }

  visit(root)
  return summaries
}

export function findNode(root: TreeNode, path: string): TreeNode | null {
  if (root.path === path) return root
  for (const child of root.children ?? []) {
    const found = findNode(child, path)
    if (found) return found
  }
  return null
}
