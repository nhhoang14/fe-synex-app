const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_TIMEOUT_MS = 15000

function assertRelativePath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('Invalid API path: expected relative path starting with "/".')
  }
}

function buildUrl(path, query = {}) {
  assertRelativePath(path)

  const base = `${API_BASE_URL}${path}`
  const url = new URL(base, window.location.origin)

  Object.entries(query).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', query, body, token, headers = {} } = options
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  let response

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }

    throw new Error('Network error. Please check your connection and try again.')
  } finally {
    window.clearTimeout(timeout)
  }

  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const fallbackMessage =
      response.status >= 500
        ? 'Server error. Please try again later.'
        : `Request failed (${response.status})`

    const message = payload?.message || payload?.error || fallbackMessage
    throw new Error(message)
  }

  return payload
}
