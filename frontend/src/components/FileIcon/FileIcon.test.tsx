import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FileIcon } from './FileIcon'

describe('FileIcon', () => {
  it('draws a drive icon for drives', () => {
    const { container } = render(<FileIcon node={{ kind: 'drive', name: 'C:/' }} />)
    expect(container.querySelector('svg')).toHaveClass('lucide-hard-drive')
  })

  it('draws a folder icon for folders', () => {
    const { container } = render(<FileIcon node={{ kind: 'folder', name: 'Docs' }} />)
    expect(container.querySelector('svg')).toHaveClass('lucide-folder')
  })
})
