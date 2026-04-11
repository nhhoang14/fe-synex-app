import { apiRequest } from './apiClient'

export function createOrGetCart(token) {
  return apiRequest('/api/cart', {
    method: 'POST',
    token,
  })
}

export function getMyCart(token) {
  return apiRequest('/api/cart/me', { token })
}

export function addProductToCart(token, { productId, quantity, cartId }) {
  return apiRequest('/api/cart/add', {
    method: 'POST',
    token,
    query: {
      productId,
      quantity,
      cartId,
    },
  })
}

export function increaseCartItem(token, productId, amount = 1) {
  return apiRequest(`/api/cart/items/${productId}/increase`, {
    method: 'PATCH',
    token,
    query: { amount },
  })
}

export function decreaseCartItem(token, productId, amount = 1) {
  return apiRequest(`/api/cart/items/${productId}/decrease`, {
    method: 'PATCH',
    token,
    query: { amount },
  })
}

export function removeCartItem(token, productId) {
  return apiRequest(`/api/cart/items/${productId}`, {
    method: 'DELETE',
    token,
  })
}
