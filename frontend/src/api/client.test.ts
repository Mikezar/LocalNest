import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, getDrives, getHealth, listDirectory, scanDirectory } from './client'

const fetchMock = vi.fn()

function textResponse(status: number, text: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
    json: async () => JSON.parse(text) as unknown,
  } as Response
}

function jsonResponse(status: number, body: unknown) {
  return textResponse(status, JSON.stringify(body))
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue(jsonResponse(200, []))
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('scanDirectory', () => {
  it('encodes the path as one URL segment', async () => {
    await scanDirectory('C:/a #b/c d')
    expect(fetchMock).toHaveBeenCalledWith('/api/directories/C%3A%2Fa%20%23b%2Fc%20d?depth=10')
  })
})

describe('getDrives', () => {
  it('lists drives from /drives', async () => {
    await getDrives()
    expect(fetchMock).toHaveBeenCalledWith('/api/drives')
  })
})

describe('listDirectory', () => {
  it('asks for one level only', async () => {
    await listDirectory('C:/x y')
    expect(fetchMock).toHaveBeenCalledWith('/api/directories/C%3A%2Fx%20y?depth=0')
  })
})

describe('errors', () => {
  it('uses the detail from the response body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { detail: 'Directory not found' }))
    const error = await scanDirectory('C:/nope').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, detail: 'Directory not found' })
  })

  it('falls back to a generic message when there is no detail', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, {}))
    await expect(getHealth()).rejects.toMatchObject({
      status: 500,
      detail: 'Request failed (500)',
    })
  })

  it('reports an unreachable backend when fetch itself fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(getHealth()).rejects.toMatchObject({ status: 0, detail: 'Backend unreachable' })
  })
})

describe('backend down behind the dev proxy', () => {
  it('treats an empty 500 from the proxy as an unreachable backend', async () => {
    fetchMock.mockResolvedValue(textResponse(500, ''))
    await expect(getHealth()).rejects.toMatchObject({ status: 500, detail: 'Backend unreachable' })
  })

  it.each([502, 503, 504])('treats %s as an unreachable backend', async (status) => {
    fetchMock.mockResolvedValue(textResponse(status, 'Bad Gateway'))
    await expect(getHealth()).rejects.toMatchObject({ detail: 'Backend unreachable' })
  })

  it('keeps a real server error distinct', async () => {
    fetchMock.mockResolvedValue(textResponse(500, 'Internal Server Error'))
    await expect(getHealth()).rejects.toMatchObject({ detail: 'Request failed (500)' })
  })
})
