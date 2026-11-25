import { File, FileText, FileType, Folder, HardDrive, type LucideIcon } from 'lucide-react'

import { extensionOf } from '../../lib/format'
import type { TreeNode } from '../../lib/tree'

const FILE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  '.pdf': { icon: FileText, color: 'var(--pdf)' },
  '.md': { icon: FileType, color: 'var(--md)' },
  '.txt': { icon: FileText, color: 'var(--txt)' },
  '.docx': { icon: FileText, color: 'var(--docx)' },
}

interface FileIconProps {
  node: Pick<TreeNode, 'kind' | 'name' | 'extension'>
  size?: number
}

export function FileIcon({ node, size = 20 }: FileIconProps) {
  if (node.kind === 'drive') {
    return <HardDrive size={size} color="var(--text-secondary)" aria-hidden="true" />
  }
  if (node.kind === 'folder') {
    return (
      <Folder
        size={size}
        color="var(--folder)"
        fill="var(--folder)"
        fillOpacity={0.35}
        aria-hidden="true"
      />
    )
  }
  const { icon: Icon, color } = FILE_ICONS[extensionOf(node)] ?? { icon: File, color: 'var(--txt)' }
  return <Icon size={size} color={color} aria-hidden="true" />
}
