import type { TreeNode } from './tree'

export interface FilteredTree {
  /** The scanned folder with only matching items and the folders that contain them. */
  root: TreeNode
  /** Folders to open so every match is visible. */
  expanded: ReadonlySet<string>
  /** Matching files and folders, not counting the scanned folder itself. */
  matches: number
}

/** [start, end) of the first case-insensitive occurrence of `query` in `text`. */
export function matchRange(text: string, query: string): [number, number] | null {
  const needle = query.trim().toLowerCase()
  if (!needle) return null
  const start = text.toLowerCase().indexOf(needle)
  return start === -1 ? null : [start, start + needle.length]
}

/** Filters the tree by name. Returns null for a blank query or when nothing matches. */
export function filterTree(root: TreeNode, query: string): FilteredTree | null {
  const needle = query.trim().toLowerCase()
  if (!needle) return null

  const expanded = new Set<string>([root.path])

  const visit = (node: TreeNode): { node: TreeNode; matches: number } | null => {
    const selfMatches = node.name.toLowerCase().includes(needle)
    if (node.kind === 'file') return selfMatches ? { node, matches: 1 } : null

    const kept: TreeNode[] = []
    let descendantMatches = 0
    for (const child of node.children ?? []) {
      const result = visit(child)
      if (result) {
        kept.push(result.node)
        descendantMatches += result.matches
      }
    }

    if (descendantMatches > 0) expanded.add(node.path)
    if (selfMatches) return { node, matches: 1 + descendantMatches }
    if (descendantMatches > 0)
      return { node: { ...node, children: kept }, matches: descendantMatches }
    return null
  }

  let matches = 0
  const children: TreeNode[] = []
  for (const child of root.children ?? []) {
    const result = visit(child)
    if (result) {
      children.push(result.node)
      matches += result.matches
    }
  }

  if (matches === 0) return null
  return { root: { ...root, children }, expanded, matches }
}
