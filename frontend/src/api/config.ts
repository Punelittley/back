
export const API_BASE = '/api'

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const hasBody = options?.body != null
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  })
}
