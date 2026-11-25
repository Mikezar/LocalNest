import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RECENT_FOLDERS_KEY, useRecentFolders } from './useRecentFolders'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useRecentFolders', () => {
  it('keeps the five most recent folders, newest first', () => {
    const { result } = renderHook(() => useRecentFolders())
    act(() => {
      for (const n of [1, 2, 3, 4, 5, 6]) result.current.add(`C:/f${n}`)
    })
    expect(result.current.recent).toEqual(['C:/f6', 'C:/f5', 'C:/f4', 'C:/f3', 'C:/f2'])
  })

  it('moves a re-added folder to the top without duplicating it', () => {
    const { result } = renderHook(() => useRecentFolders())
    act(() => {
      result.current.add('C:/a')
      result.current.add('C:/b')
      result.current.add('C:/a')
    })
    expect(result.current.recent).toEqual(['C:/a', 'C:/b'])
  })

  it('persists across mounts', () => {
    const first = renderHook(() => useRecentFolders())
    act(() => first.result.current.add('C:/kept'))
    const second = renderHook(() => useRecentFolders())
    expect(second.result.current.recent).toEqual(['C:/kept'])
    expect(localStorage.getItem(RECENT_FOLDERS_KEY)).toBe('["C:/kept"]')
  })

  it('still works when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useRecentFolders())
    expect(result.current.recent).toEqual([])
    act(() => result.current.add('C:/x'))
    expect(result.current.recent).toEqual(['C:/x'])
  })

  it('ignores corrupted stored data', () => {
    localStorage.setItem(RECENT_FOLDERS_KEY, '{not json')
    const { result } = renderHook(() => useRecentFolders())
    expect(result.current.recent).toEqual([])
  })
})
