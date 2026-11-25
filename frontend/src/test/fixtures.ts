import type { FileSystemNode } from '../api/types'

const t = '2026-11-25T09:14:00Z'

export const aPdf: FileSystemNode = {
  path: 'C:/Docs/Knowledge/Arch/a.pdf',
  name: 'a.pdf',
  kind: 'file',
  modified_at: t,
  extension: '.pdf',
  size_bytes: 2_400_000,
}

export const sMd: FileSystemNode = {
  path: 'C:/Docs/Knowledge/Arch/Dist/s.md',
  name: 's.md',
  kind: 'file',
  modified_at: t,
  extension: '.md',
  size_bytes: 12_288,
}

export const dist: FileSystemNode = {
  path: 'C:/Docs/Knowledge/Arch/Dist',
  name: 'Dist',
  kind: 'folder',
  modified_at: t,
  children: [sMd],
}

export const arch: FileSystemNode = {
  path: 'C:/Docs/Knowledge/Arch',
  name: 'Arch',
  kind: 'folder',
  modified_at: t,
  children: [aPdf, dist],
}

export const empty: FileSystemNode = {
  path: 'C:/Docs/Knowledge/Empty',
  name: 'Empty',
  kind: 'folder',
  modified_at: t,
  children: [],
}

/** Shaped like today's backend: no extension, no size. */
export const notes: FileSystemNode = {
  path: 'C:/Docs/Knowledge/notes.txt',
  name: 'notes.txt',
  kind: 'file',
  modified_at: t,
}

export const scanResult: FileSystemNode[] = [arch, empty, notes]
export const rootPath = 'C:/Docs/Knowledge'
