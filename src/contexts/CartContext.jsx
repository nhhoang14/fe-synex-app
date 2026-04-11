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
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart(null)
      return null
    }

    setLoading(true)
    try {
      const data = await getMyCart(token)
      setCart(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [token])

  const openCart = useCallback(async () => {
    if (!token) return null

    setLoading(true)
    try {
      const data = await createOrGetCart(token)
      setCart(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [token])

  const isCartLikePayload = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') {
      return false
    }

    return Boolean(
      payload.id ||
        payload.cartId ||
        Array.isArray(payload.items) ||
        Array.isArray(payload.cartItems),
    )
  }, [])

  const syncCartFromResponse = useCallback(
    async (payload) => {
      if (isCartLikePayload(payload)) {
        setCart(payload)
        return payload
      }

      return fetchCart()
    },
    [fetchCart, isCartLikePayload],
  )

  const addToCart = useCallback(async (productId, quantity = 1, cartId = '') => {
    if (!token) throw new Error('Please login first')

    const data = await addProductToCart(token, { productId, quantity, cartId })
    return syncCartFromResponse(data)
  }, [token, syncCartFromResponse])

  const increase = useCallback(async (productId, amount = 1) => {
    if (!token) return null
    const data = await increaseCartItem(token, productId, amount)
    return syncCartFromResponse(data)
  }, [token, syncCartFromResponse])

  const decrease = useCallback(async (productId, amount = 1) => {
    if (!token) return null
    const data = await decreaseCartItem(token, productId, amount)
    return syncCartFromResponse(data)
  }, [token, syncCartFromResponse])

  const remove = useCallback(async (productId) => {
    if (!token) return null

    const previousCart = cart

    // Optimistically remove the item to avoid UI flicker while waiting for API.
    setCart((currentCart) => {
      if (!currentCart) {
        return currentCart
      }

      const currentItems = getCartItems(currentCart)
      const nextItems = currentItems.filter((item) => {
        const itemProductId = getProductId(getCartItemProduct(item))
        return String(itemProductId) !== String(productId)
      })

      if (Array.isArray(currentCart.items)) {
        return { ...currentCart, items: nextItems }
      }

      if (Array.isArray(currentCart.cartItems)) {
        return { ...currentCart, cartItems: nextItems }
      }

      return currentCart
    })

    try {
      const data = await removeCartItem(token, productId)
      return await syncCartFromResponse(data)
    } catch (error) {
      setCart(previousCart)
      throw error
    }
  }, [token, cart, syncCartFromResponse])

  const items = getCartItems(cart)
  const totalItems = items.reduce((sum, item) => sum + getCartItemQuantity(item), 0)
  const totalAmount = items.reduce((sum, item) => {
    const product = item?.product || item
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
