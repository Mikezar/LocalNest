import { describe, expect, it } from 'vitest'

import { documentTypeLabel, extensionOf, formatBytes, formatBytesExact, formatDate } from './format'
import { arch, notes } from '../test/fixtures'

describe('formatBytes', () => {
  it.each([
    [3_259_302, '3.1 MB'],
    [12_288, '12 KB'],
    [0, '0 B'],
    [512, '512 B'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected)
  })
})

describe('formatBytesExact', () => {
  it('adds the exact byte count', () => {
    expect(formatBytesExact(3_259_302)).toBe('3.1 MB (3,259,302 bytes)')
  })

  it('is a dash when unknown', () => {
    expect(formatBytesExact(undefined)).toBe('—')
  })
})

describe('formatDate', () => {
  it('formats an ISO timestamp in local time', () => {
    const expected = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date('2026-11-25T09:14:00Z'))
    expect(formatDate('2026-11-25T09:14:00Z')).toBe(expected)
  })

  it('is a dash when unknown', () => {
    expect(formatDate(null)).toBe('—')
  })
})

describe('extensionOf', () => {
  it('derives the extension from the name when the API omits it', () => {
    expect(extensionOf(notes)).toBe('.txt')
  })

  it('lowercases a derived extension', () => {
    expect(extensionOf({ ...notes, name: 'REPORT.PDF' })).toBe('.pdf')
  })

  it('is empty for folders', () => {
    expect(extensionOf(arch)).toBe('')
  })
})

describe('documentTypeLabel', () => {
  it.each([
    ['.pdf', 'PDF Document'],
    ['.md', 'Markdown Document'],
    ['.txt', 'Text Document'],
    ['.docx', 'Word Document'],
    ['.xyz', 'Document'],
  ])('%s → %s', (ext, label) => {
    expect(documentTypeLabel(ext)).toBe(label)
  })
})
