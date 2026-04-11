import { apiRequest } from './apiClient'

export function getMyProfile(token) {
  return apiRequest('/api/users/me', { token })
}

export function updateMyProfile(token, payload) {
  return apiRequest('/api/users/me', {
    method: 'PUT',
    token,
    body: payload,
  })
}

export function getMyAddresses(token) {
  return apiRequest('/api/users/me/addresses', { token })
}

export function createAddress(token, payload) {
  return apiRequest('/api/users/me/addresses', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function deleteAddress(token, addressId) {
  return apiRequest(`/api/users/me/addresses/${addressId}`, {
    method: 'DELETE',
    token,
  })
}

export function setDefaultAddress(token, addressId) {
  return apiRequest(`/api/users/me/addresses/${addressId}/default`, {
    method: 'PATCH',
    token,
  })
}

export function changeMyPassword(token, payload) {
  return apiRequest('/api/users/me/password', {
    method: 'POST',
    token,
    body: payload,
  })
}
