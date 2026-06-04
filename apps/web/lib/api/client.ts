const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(
  path: string,
  opts?: RequestInit,
  serverCookie?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(serverCookie ? { Cookie: serverCookie } : {}),
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      ...headers,
      ...(opts?.headers as Record<string, string> | undefined),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { code: 'UNKNOWN', message: 'Unknown error' } }))
    throw new ApiError(res.status, body.error?.code ?? 'UNKNOWN', body.error?.message ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json() as T
}
