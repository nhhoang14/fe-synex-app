import { apiRequest } from './apiClient'

export function register(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function logout(token) {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
    token,
  })
}

export function refreshToken(token) {
  return apiRequest('/api/auth/refresh', {
    method: 'POST',
    token,
  })
}

export function extractToken(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  return payload.token || payload.accessToken || payload.jwt || ''
}
