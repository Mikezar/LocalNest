import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FolderPickerDialog } from './FolderPickerDialog'
import { ApiError, getDrives, listDirectory } from '../../api/client'
import type { FileSystemNode } from '../../api/types'
import { renderWithProviders } from '../../test/utils'

vi.mock('../../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/client')>()),
  listDirectory: vi.fn(),
  getDrives: vi.fn(),
}))

const node = (path: string, kind: FileSystemNode['kind'] = 'folder'): FileSystemNode => ({
  path,
  name: path.split('/').filter(Boolean).pop()!,
  kind,
  modified_at: '2026-11-25T09:14:00Z',
})

const listings: Record<string, FileSystemNode[]> = {
  'C:/': [node('C:/Projects'), node('C:/notes.txt', 'file')],
  'C:/Projects': [node('C:/Projects/LocalNest')],
}

beforeEach(() => {
  vi.mocked(listDirectory).mockReset()
  vi.mocked(listDirectory).mockImplementation(async (path: string) => listings[path])
  vi.mocked(getDrives).mockReset()
  vi.mocked(getDrives).mockResolvedValue(
    ['C:/', 'D:/'].map((d) => ({ name: d, path: d, kind: 'drive' as const, modified_at: '' })),
  )
})

function renderPicker(initialPath: string | null = null) {
  const onSelect = vi.fn()
  const onCancel = vi.fn()
  renderWithProviders(
    <FolderPickerDialog open initialPath={initialPath} onSelect={onSelect} onCancel={onCancel} />,
  )
  return { onSelect, onCancel, user: userEvent.setup() }
}

describe('FolderPickerDialog', () => {
  it('renders nothing when closed', () => {
    renderWithProviders(
      <FolderPickerDialog open={false} initialPath={null} onSelect={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('starts at the drives', async () => {
    renderPicker()
    expect(screen.getByRole('dialog', { name: 'Choose folder' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'C:/' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'D:/' })).toBeInTheDocument()
    expect(getDrives).toHaveBeenCalled()
    expect(listDirectory).not.toHaveBeenCalled()
  })

  it('cannot select at the drives level', async () => {
    renderPicker()
    await screen.findByRole('button', { name: 'C:/' })
    expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled()
  })

  it('navigates into folders and selects the open one', async () => {
    const { user, onSelect } = renderPicker()
    await user.click(await screen.findByRole('button', { name: 'C:/' }))
    await user.click(await screen.findByRole('button', { name: 'Projects' }))
    await screen.findByRole('button', { name: 'LocalNest' })
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith('C:/Projects')
  })

  it('goes back to the drives from the breadcrumb', async () => {
    const { user } = renderPicker('C:/Projects')
    await screen.findByRole('button', { name: 'LocalNest' })
    await user.click(screen.getByRole('button', { name: 'This PC' }))
    expect(await screen.findByRole('button', { name: 'D:/' })).toBeInTheDocument()
  })

  it('navigates up through a breadcrumb segment', async () => {
    const { user } = renderPicker('C:/Projects')
    await screen.findByRole('button', { name: 'LocalNest' })
    await user.click(screen.getByRole('button', { name: 'C:' }))
    expect(await screen.findByRole('button', { name: 'Projects' })).toBeInTheDocument()
    expect(listDirectory).toHaveBeenLastCalledWith('C:/')
  })

  it('shows API errors', async () => {
    vi.mocked(listDirectory).mockRejectedValue(new ApiError(404, 'Not Found'))
    renderPicker('C:/')
    expect(await screen.findByText('Not Found')).toBeInTheDocument()
  })

  it('cancels with the button and with Escape', async () => {
    const { user, onCancel } = renderPicker()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(2)
  })
})

function OpenerHarness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open picker
      </button>
      <FolderPickerDialog
        open={open}
        initialPath={null}
        onSelect={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

describe('FolderPickerDialog focus', () => {
  it('moves focus into the dialog when it opens', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OpenerHarness />)
    await user.click(screen.getByRole('button', { name: 'Open picker' }))
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
  })

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OpenerHarness />)
    await user.click(screen.getByRole('button', { name: 'Open picker' }))
    await screen.findByRole('button', { name: 'C:/' })
    for (let i = 0; i < 8; i++) {
      await user.tab()
      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
    }
    for (let i = 0; i < 3; i++) {
      await user.tab({ shift: true })
      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('returns focus to the opener when closed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OpenerHarness />)
    const opener = screen.getByRole('button', { name: 'Open picker' })
    await user.click(opener)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})

describe('FolderPickerDialog icons', () => {
  it('shows drives and folders by their kind', async () => {
    const { user } = renderPicker()
    expect(await screen.findByRole('button', { name: 'C:/' })).toHaveAttribute('data-kind', 'drive')
    await user.click(screen.getByRole('button', { name: 'C:/' }))
    expect(await screen.findByRole('button', { name: 'Projects' })).toHaveAttribute(
      'data-kind',
      'folder',
    )
  })
})

describe('FolderPickerDialog contents', () => {
  it('lists folders but not files', async () => {
    const { user } = renderPicker()
    await user.click(await screen.findByRole('button', { name: 'C:/' }))
    await screen.findByRole('button', { name: 'Projects' })
    expect(screen.queryByRole('button', { name: 'notes.txt' })).not.toBeInTheDocument()
  })
})
