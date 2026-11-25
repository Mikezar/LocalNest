import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TreeView } from './TreeView'
import { buildRoot } from '../../lib/tree'
import { arch, rootPath, scanResult } from '../../test/fixtures'

const root = buildRoot(rootPath, scanResult)

function row(name: string) {
  return screen.getByRole('treeitem', { name: new RegExp(`^${name}`) })
}

function renderTree(onSelect = vi.fn(), selectedPath: string | null = null) {
  render(<TreeView root={root} selectedPath={selectedPath} onSelect={onSelect} />)
  return { onSelect, user: userEvent.setup() }
}

describe('TreeView', () => {
  it('starts with only the root expanded', () => {
    renderTree()
    expect(row('Arch')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument()
  })

  it('does not render descendants of collapsed folders', () => {
    renderTree()
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
  })

  it('expands and collapses a folder with its chevron', async () => {
    const { user } = renderTree()
    const toggle = within(row('Arch')).getByRole('button', { name: 'Expand Arch' })
    await user.click(toggle)
    expect(screen.getByText('a.pdf')).toBeInTheDocument()
    await user.click(within(row('Arch')).getByRole('button', { name: 'Collapse Arch' }))
    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument()
  })

  it('shows recursive document counts and sizes on folders', () => {
    renderTree()
    expect(row('Knowledge')).toHaveTextContent('3 items · 2.3 MB')
    expect(row('Empty')).toHaveTextContent('0 items')
  })

  it('grays out folders with no documents beneath them', () => {
    renderTree()
    expect(row('Empty')).toHaveAttribute('data-empty', 'true')
    expect(row('Arch')).not.toHaveAttribute('data-empty')
  })

  it('shows a dash when a file has no size', () => {
    renderTree()
    expect(row('notes.txt')).toHaveTextContent('—')
  })

  it('selects a row on click', async () => {
    const { user, onSelect } = renderTree()
    await user.click(row('notes.txt'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'notes.txt' }))
  })

  it('marks the selected row', () => {
    renderTree(vi.fn(), scanResult[2].path)
    expect(row('notes.txt')).toHaveAttribute('aria-selected', 'true')
  })

  it('moves focus with the arrow keys and expands with ArrowRight', async () => {
    const { user } = renderTree()
    row('Knowledge').focus()
    await user.keyboard('{ArrowDown}')
    expect(row('Arch')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(row('Arch')).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{ArrowLeft}')
    expect(row('Arch')).toHaveAttribute('aria-expanded', 'false')
  })

  it('selects the focused row with Enter', async () => {
    const { user, onSelect } = renderTree()
    row('Knowledge').focus()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Arch' }))
  })
})

describe('TreeView while searching', () => {
  it('highlights the matching part of a name', () => {
    render(<TreeView root={root} selectedPath={null} onSelect={vi.fn()} query="OTE" />)
    expect(row('notes.txt').querySelector('mark')).toHaveTextContent('ote')
  })

  it('opens the folders it is told to', () => {
    render(
      <TreeView
        root={root}
        selectedPath={null}
        onSelect={vi.fn()}
        initialExpanded={new Set([root.path, arch.path])}
      />,
    )
    expect(screen.getByText('a.pdf')).toBeInTheDocument()
  })

  it('shows folder totals from the full scan, not the filtered tree', () => {
    const filtered = { ...root, children: [arch] }
    render(<TreeView root={filtered} summarySource={root} selectedPath={null} onSelect={vi.fn()} />)
    expect(row('Knowledge')).toHaveTextContent('3 items')
  })
})
