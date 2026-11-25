import type { FileSystemNode, HealthResponse } from './types'

const API_BASE = '/api'

/**
 * `depth` on GET /directories (backend allows 0–10): 0 = the folder's own items only,
 * N = N more levels below them.
 */
const SCAN_DEPTH = 10
const PICKER_DEPTH = 0

export class ApiError extends Error {
  readonly status: number
  readonly detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function request<T>(url: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new ApiError(0, 'Backend unreachable')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await errorDetail(response))
  }

  return (await response.json()) as T
}

// The Vite dev proxy answers an empty 500 (or a gateway error) when FastAPI is not running.
const GATEWAY_ERRORS = new Set([502, 503, 504])

async function errorDetail(response: Response): Promise<string> {
  const text = await response.text().catch(() => '')

  if (GATEWAY_ERRORS.has(response.status) || (response.status === 500 && text === '')) {
    return 'Backend unreachable'
  }

  try {
    const body: unknown = JSON.parse(text)
    if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') {
      return body.detail
    }
  } catch {
    // Not JSON, e.g. FastAPI's plain-text "Internal Server Error".
  }
  return `Request failed (${response.status})`
}

export function getHealth(): Promise<HealthResponse> {
  return request(`${API_BASE}/health`)
}

export function getDrives(): Promise<FileSystemNode[]> {
  return request(`${API_BASE}/drives`)
}

export function scanDirectory(path: string): Promise<FileSystemNode[]> {
  return request(`${API_BASE}/directories/${encodeURIComponent(path)}?depth=${SCAN_DEPTH}`)
}

/** One level under `path`, for the folder picker (which keeps only the folders). */
export function listDirectory(path: string): Promise<FileSystemNode[]> {
  return request(`${API_BASE}/directories/${encodeURIComponent(path)}?depth=${PICKER_DEPTH}`)
}
