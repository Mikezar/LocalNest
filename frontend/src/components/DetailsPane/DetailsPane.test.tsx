import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DetailsPane } from './DetailsPane'
import { formatDate } from '../../lib/format'
import type { TreeNode } from '../../lib/tree'
import { arch } from '../../test/fixtures'

const fastApi: TreeNode = {
  path: 'C:/Docs/Knowledge/Python/FastAPI.pdf',
  name: 'FastAPI.pdf',
  kind: 'file',
  modified_at: '2026-11-25T09:14:00Z',
  extension: '.pdf',
  size_bytes: 3_259_302,
}

function field(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling
}

describe('DetailsPane', () => {
  it('prompts for a selection when nothing is selected', () => {
    render(<DetailsPane node={null} onClose={vi.fn()} />)
    expect(screen.getByText('Select a file or folder to see details')).toBeInTheDocument()
  })

  it('shows file details', () => {
    render(<DetailsPane node={fastApi} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'FastAPI.pdf' })).toBeInTheDocument()
    expect(screen.getByText('Document')).toBeInTheDocument()
    expect(field('Path')).toHaveTextContent('C:/Docs/Knowledge/Python/FastAPI.pdf')
    expect(field('Size')).toHaveTextContent('3.1 MB (3,259,302 bytes)')
    expect(field('Extension')).toHaveTextContent('.pdf')
    expect(field('Modified')).toHaveTextContent(formatDate('2026-11-25T09:14:00Z'))
    expect(field('Type')).toHaveTextContent('PDF Document')
    expect(screen.getByText('Not indexed')).toBeInTheDocument()
  })

  it('shows unbuilt actions as coming soon', () => {
    render(<DetailsPane node={fastApi} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add to Index' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows folder details', () => {
    render(<DetailsPane node={arch} onClose={vi.fn()} />)
    expect(screen.getByText('Folder')).toBeInTheDocument()
    expect(field('Items')).toHaveTextContent('2')
    expect(field('Size')).toHaveTextContent('2.3 MB')
    expect(screen.queryByText('Extension', { selector: 'dt' })).not.toBeInTheDocument()
  })

  it('copies the path to the clipboard', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<DetailsPane node={fastApi} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Copy path' }))
    expect(writeText).toHaveBeenCalledWith('C:/Docs/Knowledge/Python/FastAPI.pdf')
  })

  it('closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DetailsPane node={fastApi} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close details' }))
    expect(onClose).toHaveBeenCalled()
  })
})
