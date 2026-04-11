const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function buildUrl(path, query = {}) {
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

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

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
    const message =
      payload?.message || payload?.error || `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload
}
