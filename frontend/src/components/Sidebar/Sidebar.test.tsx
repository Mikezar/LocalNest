import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Sidebar } from './Sidebar'
import { renderWithProviders } from '../../test/utils'

vi.mock('../../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/client')>()),
  getHealth: vi.fn(() => new Promise(() => {})),
}))

describe('Sidebar', () => {
  it('marks Library as the current page', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute('aria-current', 'page')
  })

  it.each(['Search', 'Lab', 'Settings', 'About'])('shows %s as coming soon', (label) => {
    renderWithProviders(<Sidebar />)
    const item = screen.getByRole('link', { name: label })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(item).toHaveAttribute('title', 'Coming soon')
  })
})
