import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('shows the scan totals', () => {
    render(<PageHeader stats={{ documents: 7, folders: 4, totalSize: 7_654_604 }} />)
    expect(screen.getByRole('heading', { name: 'Library Explorer' })).toBeInTheDocument()
    expect(screen.getByTestId('stat-Documents')).toHaveTextContent('7')
    expect(screen.getByTestId('stat-Folders')).toHaveTextContent('4')
    expect(screen.getByTestId('stat-Total size')).toHaveTextContent('7.3 MB')
  })

  it('shows dashes before a scan', () => {
    render(<PageHeader stats={{ documents: null, folders: null, totalSize: null }} />)
    expect(screen.getByTestId('stat-Documents')).toHaveTextContent('—')
    expect(screen.getByTestId('stat-Total size')).toHaveTextContent('—')
  })
})
