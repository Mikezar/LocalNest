import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LibraryPage } from './LibraryPage'
import { ApiError, getDrives, listDirectory, scanDirectory } from '../api/client'
import { scanResult } from '../test/fixtures'
import { renderWithProviders } from '../test/utils'

vi.mock('../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/client')>()),
  scanDirectory: vi.fn(),
  listDirectory: vi.fn(),
  getDrives: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(scanDirectory).mockReset()
  vi.mocked(listDirectory).mockReset()
})

async function scan(path: string) {
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox', { name: 'Source directory' }), path)
  await user.click(screen.getByRole('button', { name: 'Scan' }))
  return user
}

describe('LibraryPage', () => {
  it('asks for a source directory before the first scan', () => {
    renderWithProviders(<LibraryPage />)
    expect(screen.getByText('Choose a source directory and press Scan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled()
  })

  it('scans the typed path and shows the totals', async () => {
    vi.mocked(scanDirectory).mockResolvedValue(scanResult)
    renderWithProviders(<LibraryPage />)
    await scan('C:/Docs/Knowledge')
    expect(scanDirectory).toHaveBeenCalledWith('C:/Docs/Knowledge')
    expect(await screen.findByTestId('stat-Documents')).toHaveTextContent('3')
    expect(screen.getByTestId('stat-Folders')).toHaveTextContent('3')
  })

  it('disables Scan while a scan is running', async () => {
    vi.mocked(scanDirectory).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<LibraryPage />)
    await scan('C:/Docs')
    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled()
  })

  it('shows the API error and retries', async () => {
    vi.mocked(scanDirectory).mockRejectedValue(new ApiError(404, 'Directory not found'))
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/nope')
    expect(await screen.findByText('Directory not found')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(scanDirectory).toHaveBeenCalledTimes(2)
  })

  it('shows an unreachable backend instead of a blank page', async () => {
    vi.mocked(scanDirectory).mockRejectedValue(new ApiError(0, 'Backend unreachable'))
    renderWithProviders(<LibraryPage />)
    await scan('C:/Docs')
    expect(await screen.findByText('Backend unreachable')).toBeInTheDocument()
  })

  it('remembers scanned folders in the recent list', async () => {
    vi.mocked(scanDirectory).mockResolvedValue(scanResult)
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/Docs/Knowledge')
    await screen.findByTestId('stat-Documents')
    await user.click(screen.getByRole('button', { name: 'Recent folders' }))
    expect(screen.getByRole('button', { name: 'C:/Docs/Knowledge' })).toBeInTheDocument()
  })

  it('refreshes the last scan', async () => {
    vi.mocked(scanDirectory).mockResolvedValue(scanResult)
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/Docs/Knowledge')
    expect(await screen.findByTestId('stat-Documents')).toHaveTextContent('3')
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(scanDirectory).toHaveBeenCalledTimes(2)
  })
})

describe('LibraryPage selection', () => {
  it('shows details for the clicked file', async () => {
    vi.mocked(scanDirectory).mockResolvedValue(scanResult)
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/Docs/Knowledge')
    await user.click(await screen.findByRole('treeitem', { name: /^notes\.txt/ }))
    expect(screen.getByRole('heading', { name: 'notes.txt' })).toBeInTheDocument()
    expect(screen.getByText('Text Document')).toBeInTheDocument()
  })
})

describe('LibraryPage folder picker', () => {
  it('fills the source directory from the picker without scanning', async () => {
    vi.mocked(getDrives).mockResolvedValue([
      { name: 'C:/', path: 'C:/', kind: 'drive', modified_at: '' },
    ])
    vi.mocked(listDirectory).mockResolvedValue([])
    const user = userEvent.setup()
    renderWithProviders(<LibraryPage />)
    await user.click(screen.getByRole('button', { name: 'Browse folders' }))
    await user.click(await screen.findByRole('button', { name: 'C:/' }))
    await screen.findByText('No subfolders')
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Source directory' })).toHaveValue('C:/')
    expect(scanDirectory).not.toHaveBeenCalled()
  })
})

describe('LibraryPage review fixes', () => {
  it('re-scans a folder that was scanned before', async () => {
    vi.mocked(scanDirectory).mockResolvedValue(scanResult)
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/A')
    await screen.findByTestId('stat-Documents')
    const input = screen.getByRole('textbox', { name: 'Source directory' })
    await user.clear(input)
    await user.type(input, 'C:/B')
    await user.click(screen.getByRole('button', { name: 'Scan' }))
    await user.clear(input)
    await user.type(input, 'C:/A')
    await user.click(screen.getByRole('button', { name: 'Scan' }))
    await vi.waitFor(() => expect(scanDirectory).toHaveBeenCalledTimes(3))
  })

  it('drops a selection that no longer exists after Refresh', async () => {
    vi.mocked(scanDirectory).mockResolvedValueOnce(scanResult)
    vi.mocked(scanDirectory).mockResolvedValueOnce(scanResult.filter((n) => n.name !== 'notes.txt'))
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/Docs/Knowledge')
    await user.click(await screen.findByRole('treeitem', { name: /^notes\.txt/ }))
    expect(screen.getByRole('heading', { name: 'notes.txt' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(await screen.findByText('Select a file or folder to see details')).toBeInTheDocument()
  })

  it('shows refreshed data for the selected node', async () => {
    const [arch, empty, notes] = scanResult
    vi.mocked(scanDirectory).mockResolvedValueOnce(scanResult)
    vi.mocked(scanDirectory).mockResolvedValueOnce([arch, empty, { ...notes, size_bytes: 2048 }])
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/Docs/Knowledge')
    await user.click(await screen.findByRole('treeitem', { name: /^notes\.txt/ }))
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(await screen.findByText('2 KB (2,048 bytes)')).toBeInTheDocument()
  })
})

describe('LibraryPage search', () => {
  async function scanned() {
    vi.mocked(scanDirectory).mockResolvedValue(scanResult)
    renderWithProviders(<LibraryPage />)
    const user = await scan('C:/Docs/Knowledge')
    await screen.findByRole('treeitem', { name: /^Arch/ })
    return { user, search: screen.getByRole('searchbox', { name: 'Search files and folders' }) }
  }

  const treeNames = () =>
    screen
      .getAllByRole('treeitem')
      .map((item) => item.querySelector('[class*="name"]')?.textContent)

  it('has no search box before a scan', () => {
    renderWithProviders(<LibraryPage />)
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('narrows the tree to matches and the folders containing them', async () => {
    const { user, search } = await scanned()
    await user.type(search, 's.md')
    expect(treeNames()).toEqual(['Knowledge', 'Arch', 'Dist', 's.md'])
    expect(screen.getByText('1 match')).toBeInTheDocument()
  })

  it('keeps the page totals for the whole scan', async () => {
    const { user, search } = await scanned()
    await user.type(search, 'notes')
    expect(screen.getByTestId('stat-Documents')).toHaveTextContent('3')
  })

  it('says when nothing matches', async () => {
    const { user, search } = await scanned()
    await user.type(search, 'zzz')
    expect(screen.queryAllByRole('treeitem')).toHaveLength(0)
    expect(screen.getByText('No files or folders match “zzz”')).toBeInTheDocument()
  })

  it('clears the search', async () => {
    const { user, search } = await scanned()
    await user.type(search, 'notes')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(search).toHaveValue('')
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
  })
})
