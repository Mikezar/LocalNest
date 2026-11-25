import { useQuery } from '@tanstack/react-query'

import { scanDirectory } from '../api/client'

export function useScan(path: string | null) {
  return useQuery({
    queryKey: ['scan', path],
    queryFn: () => scanDirectory(path!),
    enabled: path !== null,
    staleTime: Infinity,
  })
}
