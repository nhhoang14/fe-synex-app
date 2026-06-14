import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProductById, getProducts } from '../services/catalogService'
import { ROUTES } from '../constants'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  
  // State Toast Notification
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(100)

  // State quản lý danh sách sản phẩm đã thích
  const [likedIds, setLikedIds] = useState([])

  usePageTitle(product ? `${getProductName(product)} - Synex` : 'Chi tiết sản phẩm - Synex')

  // Tự động ẩn thông báo sau 3 giây và chạy thanh progress
  useEffect(() => {
    if (message) {
      setProgress(100)
      const animTimer = setTimeout(() => setProgress(0), 50)
      const closeTimer = setTimeout(() => setMessage(''), 3000)
      return () => {
        clearTimeout(animTimer)
        clearTimeout(closeTimer)
      }
    }
  }, [message])

  function loadLikedIds() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLikedIds(wishlist.map((item) => getProductId(item)).filter(Boolean))
  }

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)

        const [productData, productList] = await Promise.all([
          getProductById(id),
          getProducts(),
        ])

        if (!mounted) return

        setProduct(productData || null)
        setAllProducts(Array.isArray(productList) ? productList : [])
      } catch {
        if (!mounted) return
        setProduct(null)
        setAllProducts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    loadLikedIds()
    window.addEventListener('wishlistUpdated', loadLikedIds)

    return () => {
      window.removeEventListener('wishlistUpdated', loadLikedIds)
    }
  }, [])

  const relatedProducts = useMemo(() => {
    if (!product || !Array.isArray(allProducts)) return []

    const currentId = String(getProductId(product))
    const currentCategory = String(
      product?.category?.name || product?.categoryName || '',
    ).toLowerCase()

    return allProducts
      .filter((item) => String(getProductId(item)) !== currentId)
      .filter((item) => {
        const itemCategory = String(
          item?.category?.name || item?.categoryName || '',
        ).toLowerCase()

        if (!currentCategory) return true
        return itemCategory === currentCategory
      })
      .slice(0, 4)
  }, [product, allProducts])

  async function handleAddToCart() {
    const productId = getProductId(product)

    if (!productId) {
      setMessage('Không tìm thấy mã sản phẩm')
      return
    }

    try {
      await addToCart(productId, quantity)
      setMessage('Đã thêm vào giỏ hàng')
    } catch (error) {
      setMessage(error.message || 'Không thể thêm vào giỏ hàng')
    }
  }

  function handleToggleWishlist(event, itemToToggle) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const productId = getProductId(itemToToggle)
    if (!productId) return

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const exists = wishlist.some((item) => getProductId(item) === productId)

    let newWishlist

    if (exists) {
      newWishlist = wishlist.filter((item) => getProductId(item) !== productId)
    } else {
      newWishlist = [...wishlist, itemToToggle]
    }

    localStorage.setItem('wishlist', JSON.stringify(newWishlist))
    setLikedIds(newWishlist.map((item) => getProductId(item)).filter(Boolean))
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const isSuccess = message.toLowerCase().includes('đã') || message.toLowerCase().includes('thành công')

  if (loading) {
    return (
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-slate-600">Đang tải chi tiết sản phẩm...</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Không tìm thấy sản phẩm</h1>
        <p className="mt-3 text-slate-600">
          Sản phẩm này có thể không tồn tại hoặc đã bị xoá.
        </p>
        <Link
          to={ROUTES.PRODUCTS}
          className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Quay lại trang sản phẩm
        </Link>
      </section>
    )
  }

  const productId = getProductId(product)
  const productName = getProductName(product)
  const price = getProductPrice(product)
  const image = getProductImage(product)
  const categoryName = product?.category?.name || product?.categoryName || 'Đang cập nhật'
  const brandName = product?.brand?.name || product?.brandName || 'Đang cập nhật'
  const description =
    product?.description ||
    product?.details ||
    'Sản phẩm công nghệ chính hãng tại Synex, thiết kế hiện đại và phù hợp cho nhu cầu học tập, làm việc và giải trí hằng ngày.'

  const stock =
    typeof product?.stock === 'number'
      ? product.stock
      : typeof product?.quantity === 'number'
        ? product.quantity
        : null
        
  const isMainProductLiked = likedIds.includes(productId)

  return (
    <div className="space-y-6">
      
      {/* TOAST THÔNG BÁO NỔI DẠNG OVERLAY */}
      {message && (
        <div className="fixed top-8 left-1/2 z-[9999] flex min-w-[320px] -translate-x-1/2 items-center justify-between overflow-hidden rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
              {isSuccess ? (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <span className="text-xs font-bold">!</span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="ml-6 text-slate-400 hover:text-slate-600 transition">
            ✕
          </button>
          <div 
            className={`absolute bottom-0 left-0 h-1 transition-all duration-[3000ms] ease-linear ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}

      <nav className="text-sm text-slate-500">
        <Link to={ROUTES.HOME} className="hover:text-slate-900">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to={ROUTES.PRODUCTS} className="hover:text-slate-900">
          Sản phẩm
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{productName}</span>
      </nav>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-50">
            <button
              type="button"
              onClick={(e) => handleToggleWishlist(e, product)}
              className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white/90 text-2xl shadow-sm transition hover:scale-105"
              aria-label="Thích sản phẩm"
            >
              <span className={isMainProductLiked ? 'text-red-500' : 'text-slate-500'}>
                {isMainProductLiked ? '♥' : '♡'}
              </span>
            </button>
            
            <img
              src={image}
              alt={productName}
              className="aspect-[4/4] w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                {categoryName}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {brandName}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {productName}
            </h1>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {formatCurrency(price)}
            </p>

            <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Tình trạng</p>
                <p className="mt-1 font-semibold text-ink">
                  {product?.available === false
                    ? 'Hết hàng'
                    : stock !== null
                      ? stock > 0
                        ? `Còn ${stock} sản phẩm`
                        : 'Hết hàng'
                      : 'Còn hàng'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Mã sản phẩm</p>
                <p className="mt-1 font-semibold text-ink">{productId || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold text-ink">Mô tả sản phẩm</h2>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="w-28 rounded-2xl border border-border bg-white px-4 py-3 text-center outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-ink">Sản phẩm liên quan</h2>
            <Link
              to={ROUTES.PRODUCTS}
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item, index) => {
              return (
                <ProductCard
                  key={item.id || item.productId || index}
                  product={item}
                  compact
                  onNotify={(msg) => setMessage(msg)}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage