import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './client'

const MAX_RETRIES = 1

/** Retry only failures that may be transient; a missing folder (4xx) won't fix itself. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  const transient = error.status === 0 || error.status >= 500
  return transient && failureCount < MAX_RETRIES
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: shouldRetry, refetchOnWindowFocus: false } },
  })
}
