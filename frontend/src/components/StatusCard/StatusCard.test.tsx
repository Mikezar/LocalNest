import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StatusCard } from './StatusCard'
import { ApiError, getHealth } from '../../api/client'
import { renderWithProviders } from '../../test/utils'

vi.mock('../../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/client')>()),
  getHealth: vi.fn(),
}))

describe('StatusCard', () => {
  it('shows a connected backend and its version', async () => {
    vi.mocked(getHealth).mockResolvedValue({
      status: 'healthy',
      application: 'LocalNest',
      version: '0.1.0',
      environment: 'development',
    })
    renderWithProviders(<StatusCard />)
    expect(await screen.findByText('Backend: connected')).toBeInTheDocument()
    expect(screen.getByText('v0.1.0')).toBeInTheDocument()
  })

  it('shows an unreachable backend', async () => {
    vi.mocked(getHealth).mockRejectedValue(new ApiError(0, 'Backend unreachable'))
    renderWithProviders(<StatusCard />)
    expect(await screen.findByText('Backend: unreachable')).toBeInTheDocument()
  })
})
