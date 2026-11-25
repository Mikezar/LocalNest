import { describe, expect, it } from 'vitest'

import {
  buildRoot,
  countDocuments,
  countFolders,
  findNode,
  flattenVisible,
  hasDocuments,
  summarizeFolders,
  totalSize,
} from './tree'
import { arch, empty, notes, rootPath, scanResult } from '../test/fixtures'

const root = buildRoot(rootPath, scanResult)

describe('buildRoot', () => {
  it('names the root after the last path segment', () => {
    expect(root).toMatchObject({ name: 'Knowledge', kind: 'folder', modified_at: null })
    expect(root.children).toBe(scanResult)
  })

  it('handles backslashes and trailing separators', () => {
    expect(buildRoot('C:\\Docs\\Knowledge\\', []).name).toBe('Knowledge')
  })

  it('keeps a drive root as its own name', () => {
    expect(buildRoot('C:/', []).name).toBe('C:/')
  })
})

describe('counts', () => {
  it('counts documents recursively', () => {
    expect(countDocuments(root)).toBe(3)
  })

  it('counts folders beneath the node', () => {
    expect(countFolders(root)).toBe(3)
  })

  it('sums known sizes', () => {
    expect(totalSize(root)).toBe(2_412_288)
  })

  it('has no size when no file reports one', () => {
    expect(totalSize(buildRoot(rootPath, [notes]))).toBeNull()
  })
})

describe('hasDocuments', () => {
  it('is false for a folder without documents', () => {
    expect(hasDocuments(empty)).toBe(false)
  })

  it('is true for a folder with a nested document', () => {
    expect(hasDocuments(arch)).toBe(true)
  })
})

describe('flattenVisible', () => {
  it('includes only children of expanded folders', () => {
    const rows = flattenVisible(root, new Set([root.path]))
    expect(rows.map((r) => r.node.name)).toEqual(['Knowledge', 'Arch', 'Empty', 'notes.txt'])
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 1, 1])
  })

  it('descends into nested expanded folders in order', () => {
    const rows = flattenVisible(root, new Set([root.path, arch.path]))
    expect(rows.map((r) => r.node.name)).toEqual([
      'Knowledge',
      'Arch',
      'a.pdf',
      'Dist',
      'Empty',
      'notes.txt',
    ])
  })
})

describe('summarizeFolders', () => {
  it('summarizes every folder in one pass', () => {
    const summary = summarizeFolders(root)
    expect(summary.get(root.path)).toEqual({ documents: 3, size: 2_412_288 })
    expect(summary.get(arch.path)).toEqual({ documents: 2, size: 2_412_288 })
    expect(summary.get(empty.path)).toEqual({ documents: 0, size: null })
  })
})

describe('findNode', () => {
  it('finds a nested node by path', () => {
    expect(findNode(root, 'C:/Docs/Knowledge/Arch/Dist/s.md')?.name).toBe('s.md')
  })

  it('returns null for a missing path', () => {
    expect(findNode(root, 'C:/Docs/Knowledge/gone.md')).toBeNull()
  })
})
