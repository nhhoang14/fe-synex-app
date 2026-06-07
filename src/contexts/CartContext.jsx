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

  const addToCart = useCallback(async (productId, quantity = 1, variantId = null) => {
    if (!token) throw new Error('Vui lòng đăng nhập trước khi mua hàng')

    await addProductToCart(token, { productId, quantity, variantId })
    return await fetchCart()
  }, [token, fetchCart])

  const increase = useCallback(async (productId, amount = 1) => {
    if (!token) return null

    // ĐÃ SỬA: Cập nhật giao diện tăng số lượng ngay lập tức để không bị kẹt
    setCart(prev => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(item => {
        const prodId = String(getProductId(getCartItemProduct(item)));
        if (prodId === String(productId)) {
          return { ...item, quantity: getCartItemQuantity(item) + amount };
        }
        return item;
      });
    });

    try {
      await increaseCartItem(token, productId, amount)
    } catch (error) {
      await fetchCart() // Nếu backend lỗi thì tải lại
    }
  }, [token, fetchCart])

  const decrease = useCallback(async (productId, amount = 1) => {
    if (!token) return null

    // ĐÃ SỬA: Cập nhật giao diện giảm số lượng ngay lập tức
    setCart(prev => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(item => {
        const prodId = String(getProductId(getCartItemProduct(item)));
        if (prodId === String(productId)) {
          return { ...item, quantity: Math.max(1, getCartItemQuantity(item) - amount) };
        }
        return item;
      });
    });

    try {
      await decreaseCartItem(token, productId, amount)
    } catch (error) {
      await fetchCart()
    }
  }, [token, fetchCart])

  const remove = useCallback(async (productId) => {
    if (!token) return null

    const previousCart = cart

    setCart((currentCart) => {
      if (!currentCart) return currentCart
      
      if (Array.isArray(currentCart)) {
        return currentCart.filter((item) => {
          const itemProductId = getProductId(getCartItemProduct(item))
          return String(itemProductId) !== String(productId)
        })
      }

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
      return await fetchCart() 
    } catch (error) {
      setCart(previousCart) 
      throw error
    }
  }, [token, cart, fetchCart])

  const items = Array.isArray(cart) ? cart : (getCartItems(cart) || [])
  
  const totalItems = items.reduce((sum, item) => sum + getCartItemQuantity(item), 0)
  
  // ĐÃ SỬA: Truyền 'item' thẳng vào getProductPrice để lấy được giá của variant
  const totalAmount = items.reduce((sum, item) => {
    return sum + getCartItemQuantity(item) * getProductPrice(item)
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
    [cart, items, totalItems, totalAmount, loading, openCart, fetchCart, addToCart, increase, decrease, remove],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}