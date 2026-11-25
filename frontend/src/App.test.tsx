import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'
import { renderWithProviders } from './test/utils'

describe('App', () => {
  it('shows the Library Explorer heading', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('heading', { name: 'Library Explorer' })).toBeInTheDocument()
  })
})
