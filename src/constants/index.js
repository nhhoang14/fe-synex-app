export const APP_NAME = 'Synex'

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CONTACT: '/contact',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNT: '/account',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
}

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'synex_access_token',
}

export const ROLE_PREFIX = 'ROLE_'

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
}

export const PAYMENT_METHODS = [
  { value: 'COD', label: 'COD' },
  { value: 'CARD', label: 'CARD' },
]

export const NAV_ITEMS = [
  { to: ROUTES.HOME, label: 'Trang chủ' },
  { to: ROUTES.PRODUCTS, label: 'Sản phẩm' },
  { to: ROUTES.CONTACT, label: 'Liên hệ' },
]

export function resolveRoleValue(source) {
  const rawRole =
    source?.role ||
    source?.userRole ||
    source?.account?.role ||
    source?.account?.userRole ||
    source?.authorities?.[0]?.authority ||
    source?.authorities?.[0]?.role ||
    source?.roles?.[0]?.authority ||
    source?.roles?.[0]?.role ||
    'USER'

  return String(rawRole).replace(ROLE_PREFIX, '').toUpperCase()
}