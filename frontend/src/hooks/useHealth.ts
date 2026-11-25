import { useQuery } from '@tanstack/react-query'

import { getHealth } from '../api/client'

export const HEALTH_POLL_MS = 15_000

export function useHealth() {
  return useQuery({ queryKey: ['health'], queryFn: getHealth, refetchInterval: HEALTH_POLL_MS })
}
