import { describe, expect, it } from 'vitest'

import { ApiError } from './client'
import { shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it('never retries client errors such as a missing folder', () => {
    expect(shouldRetry(0, new ApiError(404, 'Directory not found'))).toBe(false)
    expect(shouldRetry(0, new ApiError(400, 'Not a directory'))).toBe(false)
  })

  it('retries an unreachable backend or server error once', () => {
    expect(shouldRetry(0, new ApiError(0, 'Backend unreachable'))).toBe(true)
    expect(shouldRetry(0, new ApiError(503, 'Backend unreachable'))).toBe(true)
    expect(shouldRetry(1, new ApiError(0, 'Backend unreachable'))).toBe(false)
  })

  it('does not retry unknown errors', () => {
    expect(shouldRetry(0, new Error('boom'))).toBe(false)
  })
})
