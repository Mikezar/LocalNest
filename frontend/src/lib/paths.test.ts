import { describe, expect, it } from 'vitest'

import { breadcrumbs } from './paths'

describe('breadcrumbs', () => {
  it('splits a Windows path, keeping the drive root', () => {
    expect(breadcrumbs('C:/Projects/LocalNest')).toEqual([
      { label: 'C:', path: 'C:/' },
      { label: 'Projects', path: 'C:/Projects' },
      { label: 'LocalNest', path: 'C:/Projects/LocalNest' },
    ])
  })

  it('accepts a typed Windows path with backslashes', () => {
    expect(breadcrumbs('C:\\Docs\\Notes')).toEqual([
      { label: 'C:', path: 'C:/' },
      { label: 'Docs', path: 'C:/Docs' },
      { label: 'Notes', path: 'C:/Docs/Notes' },
    ])
  })

  it('splits a POSIX path', () => {
    expect(breadcrumbs('/home/me')).toEqual([
      { label: 'home', path: '/home' },
      { label: 'me', path: '/home/me' },
    ])
  })
})
