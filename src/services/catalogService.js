import { apiRequest } from './apiClient'

export function getProducts() {
  return apiRequest('/api/products')
}

export function getProductById(id) {
  return apiRequest(`/api/products/${id}`)
}

export function getCategories() {
  return apiRequest('/api/categories')
}

export function getBrands() {
  return apiRequest('/api/brands')
}
