export function getProductId(product) {
  return product?.id || product?.productId || product?.product?.id || ''
}

export function getProductName(product) {
  return product?.name || product?.productName || product?.title || 'Unnamed product'
}

export function getProductImage(product) {
  // Ưu tiên lấy ảnh từ variant đầu tiên nếu có
  if (product?.variants && product.variants.length > 0 && product.variants[0].imageUrl) {
    return product.variants[0].imageUrl;
  }
  return (
    product?.imageUrl ||
    product?.thumbnail ||
    product?.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
  )
}

// ĐÃ SỬA: Lấy giá từ biến thể (variant) thay vì sản phẩm gốc
export function getProductPrice(itemOrProduct) {
  // 1. Nếu là item trong giỏ hàng (đã chọn sẵn variant)
  if (itemOrProduct?.variant?.price) {
    return Number(itemOrProduct.variant.price);
  }

  // 2. Nếu là product (đang ở trang danh sách sản phẩm)
  const product = itemOrProduct?.product || itemOrProduct;
  if (product?.variants && product.variants.length > 0) {
    return Number(product.variants[0].price || 0); // Lấy giá của variant đầu tiên
  }

  // 3. Fallback mặc định
  return Number(product?.price || product?.unitPrice || product?.amount || 0);
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