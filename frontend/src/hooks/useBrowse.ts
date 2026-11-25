import { useQuery } from '@tanstack/react-query'

import { getDrives, listDirectory } from '../api/client'
import type { BrowseResponse } from '../api/types'

async function listFolders(path: string): Promise<BrowseResponse> {
  const nodes = await listDirectory(path)
  return {
    path,
    parent: null,
    entries: nodes
      .filter((node) => node.kind === 'folder')
      .map(({ name, path }) => ({ name, path, kind: 'folder' })),
  }
}

async function listDrives(): Promise<BrowseResponse> {
  const drives = await getDrives()
  return {
    path: null,
    parent: null,
    entries: drives.map(({ name, path }) => ({ name, path, kind: 'drive' })),
  }
}

/** The drives when `path` is null, otherwise one level of folders under `path`. */
export function useBrowse(path: string | null) {
  return useQuery({
    queryKey: ['browse', path],
    queryFn: () => (path === null ? listDrives() : listFolders(path)),
  })
}
