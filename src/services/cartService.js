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

// ĐÃ SỬA: Xóa cartId, thay bằng variantId (để tương thích chuẩn với @RequestParam của Spring Boot)
export function addProductToCart(token, { productId, quantity, variantId }) {
  const query = { productId, quantity }
  
  // Chỉ đính kèm variantId nếu có giá trị (vì Required = false ở backend)
  if (variantId) {
    query.variantId = variantId
  }

  return apiRequest('/api/cart/add', {
    method: 'POST',
    token,
    query,
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