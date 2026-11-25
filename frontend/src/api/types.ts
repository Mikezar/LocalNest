export type NodeKind = 'file' | 'folder' | 'drive'

export interface HealthResponse {
  status: 'healthy'
  application: string
  version: string
  environment: string
}

export interface FileSystemNode {
  path: string
  name: string
  kind: NodeKind
  modified_at: string
  extension?: string | null
  size_bytes?: number | null
  children?: FileSystemNode[] | null
}

export interface BrowseEntry {
  name: string
  path: string
  /** Optional on the wire; the picker treats a missing kind as a folder. */
  kind?: Extract<NodeKind, 'drive' | 'folder'>
}

export interface BrowseResponse {
  path: string | null
  parent: string | null
  entries: BrowseEntry[]
}
