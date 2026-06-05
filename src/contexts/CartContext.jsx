import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  addProductToCart,
  createOrGetCart,
  decreaseCartItem,
  getMyCart,
  increaseCartItem,
  removeCartItem,
} from '../services/cartService'
import {
  getCartItemProduct,
  getCartItemQuantity,
  getCartItems,
  getProductId,
  getProductPrice,
} from '../utils/normalizers'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token } = useAuth()
  
  // Khởi tạo cart là mảng rỗng để an toàn khi map()
  const [cart, setCart] = useState([]) 
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart([])
      return []
    }

    setLoading(true)
    try {
      const data = await getMyCart(token)
      // Backend trả về List<CartItem>, nên data là Array
      const cartData = Array.isArray(data) ? data : []
      setCart(cartData)
      return cartData
    } finally {
      setLoading(false)
    }
  }, [token])

  const openCart = useCallback(async () => {
    if (!token) return null

    setLoading(true)
    try {
      const data = await createOrGetCart(token)
      const cartData = Array.isArray(data) ? data : []
      setCart(cartData)
      return cartData
    } finally {
      setLoading(false)
    }
  }, [token])

  // ĐÃ SỬA: Đổi tham số cuối thành variantId = null
  const addToCart = useCallback(async (productId, quantity = 1, variantId = null) => {
    if (!token) throw new Error('Vui lòng đăng nhập trước khi mua hàng')

    await addProductToCart(token, { productId, quantity, variantId })
    return await fetchCart()
  }, [token, fetchCart])

  const increase = useCallback(async (productId, amount = 1) => {
    if (!token) return null
    await increaseCartItem(token, productId, amount)
    return await fetchCart()
  }, [token, fetchCart])

  const decrease = useCallback(async (productId, amount = 1) => {
    if (!token) return null
    await decreaseCartItem(token, productId, amount)
    return await fetchCart()
  }, [token, fetchCart])

  const remove = useCallback(async (productId) => {
    if (!token) return null

    const previousCart = cart

    // Optimistic update: Ẩn ngay item trên giao diện để tránh giật lag UI chờ API
    setCart((currentCart) => {
      if (!currentCart) return currentCart
      
      if (Array.isArray(currentCart)) {
        return currentCart.filter((item) => {
          const itemProductId = getProductId(getCartItemProduct(item))
          return String(itemProductId) !== String(productId)
        })
      }

      // Đề phòng trường hợp format khác
      const currentItems = getCartItems(currentCart)
      const nextItems = currentItems.filter((item) => {
        const itemProductId = getProductId(getCartItemProduct(item))
        return String(itemProductId) !== String(productId)
      })

      if (Array.isArray(currentCart.items)) return { ...currentCart, items: nextItems }
      if (Array.isArray(currentCart.cartItems)) return { ...currentCart, cartItems: nextItems }

      return currentCart
    })

    try {
      await removeCartItem(token, productId)
      return await fetchCart() // Gọi lại DB để đồng bộ cuối cùng
    } catch (error) {
      setCart(previousCart) // Nếu lỗi thì khôi phục lại UI như cũ
      throw error
    }
  }, [token, cart, fetchCart])

  // Đồng bộ item: đảm bảo items luôn là mảng để giao diện đếm và tính tiền
  const items = Array.isArray(cart) ? cart : (getCartItems(cart) || [])
  
  const totalItems = items.reduce((sum, item) => sum + getCartItemQuantity(item), 0)
  const totalAmount = items.reduce((sum, item) => {
    const product = getCartItemProduct(item)
    return sum + getCartItemQuantity(item) * getProductPrice(product)
  }, 0)

  const value = useMemo(
    () => ({
      cart,
      items,
      totalItems,
      totalAmount,
      loading,
      openCart,
      fetchCart,
      addToCart,
      increase,
      decrease,
      remove,
    }),
    [
      cart,
      items,
      totalItems,
      totalAmount,
      loading,
      openCart,
      fetchCart,
      addToCart,
      increase,
      decrease,
      remove,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}