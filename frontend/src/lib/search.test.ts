import { describe, expect, it } from 'vitest'

import { filterTree, matchRange } from './search'
import { buildRoot, flattenVisible } from './tree'
import { arch, rootPath, scanResult } from '../test/fixtures'

const root = buildRoot(rootPath, scanResult)

function visibleNames(query: string): string[] {
  const result = filterTree(root, query)
  if (!result) return []
  return flattenVisible(result.root, result.expanded).map((row) => row.node.name)
}

describe('filterTree', () => {
  it('keeps a matching file with the folders that contain it, opened', () => {
    expect(visibleNames('s.md')).toEqual(['Knowledge', 'Arch', 'Dist', 's.md'])
  })

  it('drops siblings that do not match', () => {
    expect(visibleNames('notes')).toEqual(['Knowledge', 'notes.txt'])
  })

  it('ignores case', () => {
    expect(visibleNames('NOTES')).toEqual(['Knowledge', 'notes.txt'])
  })

  it('keeps all contents of a matching folder, collapsed', () => {
    const result = filterTree(root, 'arch')!
    const archNode = result.root.children!.find((n) => n.name === 'Arch')!
    expect(archNode.children).toBe(arch.children)
    expect(result.expanded.has(archNode.path)).toBe(false)
  })

  it('counts matching files and folders, not the scanned folder itself', () => {
    expect(filterTree(root, 'a')!.matches).toBe(2)
    expect(filterTree(root, 'Knowledge')).toBeNull()
  })

  it('returns null when nothing matches', () => {
    expect(filterTree(root, 'zzz')).toBeNull()
  })

  it('treats a blank query as no filter', () => {
    expect(filterTree(root, '   ')).toBeNull()
  })

  it('trims the query', () => {
    expect(visibleNames('  notes ')).toEqual(['Knowledge', 'notes.txt'])
  })
})

describe('matchRange', () => {
  it('finds the match ignoring case', () => {
    expect(matchRange('FastAPI.pdf', 'api')).toEqual([4, 7])
  })

  it('returns null without a match or query', () => {
    expect(matchRange('FastAPI.pdf', 'zzz')).toBeNull()
    expect(matchRange('FastAPI.pdf', '')).toBeNull()
  })
})
