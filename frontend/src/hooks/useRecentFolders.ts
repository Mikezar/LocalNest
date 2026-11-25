import { useCallback, useState } from 'react'

export const RECENT_FOLDERS_KEY = 'localnest.recentFolders'
const MAX_RECENT = 5

function load(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_FOLDERS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : []
  } catch {
    return []
  }
}

function save(paths: string[]) {
  try {
    localStorage.setItem(RECENT_FOLDERS_KEY, JSON.stringify(paths))
  } catch {
    // Storage blocked (private mode, policy): recents just won't survive a reload.
  }
}

export function useRecentFolders() {
  const [recent, setRecent] = useState<string[]>(load)

  const add = useCallback((path: string) => {
    setRecent((current) => {
      const next = [path, ...current.filter((p) => p !== path)].slice(0, MAX_RECENT)
      save(next)
      return next
    })
  }, [])

  return { recent, add }
}
