export function getProductId(product) {
  return product?.id || product?.productId || product?.product?.id || ''
}

export function getProductName(product) {
  return product?.name || product?.productName || product?.title || 'Unnamed product'
}

export function normalizeImageUrl(path) {
  if (!path || typeof path !== 'string' || path === 'null') return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  
  // Sử dụng VITE_API_URL hoặc mặc định localhost:8080 theo yêu cầu
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`;
  return `${API_URL}/${cleanPath}`;
}

export function getProductImage(product) {
  const path = product?.variants?.[0]?.imageUrl || 
               product?.imageUrl || 
               product?.thumbnail || 
               product?.image;

  if (!path) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
  return normalizeImageUrl(path);
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