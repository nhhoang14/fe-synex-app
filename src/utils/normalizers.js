export function getProductId(product) {
  return product?.id || product?.productId || product?.product?.id || ''
}

export function getProductName(product) {
  return product?.name || product?.productName || product?.title || 'Unnamed product'
}

export function getProductImage(product) {
  return (
    product?.imageUrl ||
    product?.thumbnail ||
    product?.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
  )
}

export function getProductPrice(product) {
  return Number(product?.price || product?.unitPrice || product?.amount || 0)
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function getCartItems(cart) {
  return cart?.items || cart?.cartItems || []
}

export function getCartItemProduct(item) {
  return item?.product || item
}

export function getCartItemQuantity(item) {
  return Number(item?.quantity || item?.qty || 1)
}

export function getAddressLabel(address) {
  return [
    address?.addressLine,
    address?.district,
    address?.city,
    address?.country,
  ]
    .filter(Boolean)
    .join(', ')
}
