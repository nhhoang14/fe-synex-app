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

// Bổ sung API Quên mật khẩu
export function forgotPassword(payload) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: payload,
  })
}

// Bổ sung API Đổi mật khẩu mới
export function resetPassword(payload) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: payload,
  })
}

export function extractToken(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  return payload.token || payload.accessToken || payload.jwt || ''
}