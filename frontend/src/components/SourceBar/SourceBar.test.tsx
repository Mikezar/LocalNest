import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SourceBar } from './SourceBar'

function Harness({ onBrowse = vi.fn() }: { onBrowse?: () => void }) {
  const [value, setValue] = useState('')
  return (
    <SourceBar
      value={value}
      onChange={setValue}
      onScan={vi.fn()}
      onRefresh={vi.fn()}
      onBrowse={onBrowse}
      recent={['C:/One', 'C:/Two']}
      scanning={false}
      canRefresh={false}
    />
  )
}

describe('SourceBar recent folders', () => {
  it('picks a recent folder with the keyboard', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    screen.getByRole('button', { name: 'Recent folders' }).focus()
    await user.keyboard('{Enter}')
    await user.tab()
    expect(screen.getByRole('button', { name: 'C:/One' })).toHaveFocus()
    await user.tab()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('textbox', { name: 'Source directory' })).toHaveValue('C:/Two')
    expect(screen.queryByRole('button', { name: 'C:/One' })).not.toBeInTheDocument()
  })

  it('closes the menu with Escape and returns focus to its button', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const toggle = screen.getByRole('button', { name: 'Recent folders' })
    await user.click(toggle)
    await user.tab()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'C:/One' })).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })

  it('closes the menu on an outside click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Recent folders' }))
    await user.click(document.body)
    expect(screen.queryByRole('button', { name: 'C:/One' })).not.toBeInTheDocument()
  })

  it('opens the picker from the menu', async () => {
    const user = userEvent.setup()
    const onBrowse = vi.fn()
    render(<Harness onBrowse={onBrowse} />)
    await user.click(screen.getByRole('button', { name: 'Recent folders' }))
    await user.click(screen.getByRole('button', { name: 'Browse…' }))
    expect(onBrowse).toHaveBeenCalled()
  })
})

describe('SourceBar layout', () => {
  it('has no view switcher; the tree is the only view', () => {
    render(<Harness />)
    expect(screen.queryByRole('group', { name: 'View' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /view$/ })).not.toBeInTheDocument()
  })
})
