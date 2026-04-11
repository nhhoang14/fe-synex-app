import { apiRequest } from './apiClient'

export function createOrder(token, payload) {
  return apiRequest('/api/orders', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function getMyOrders(token) {
  return apiRequest('/api/orders', { token })
}

export function getOrderDetail(token, orderId) {
  return apiRequest(`/api/orders/${orderId}`, { token })
}
