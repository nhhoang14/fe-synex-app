import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductCard({ product, compact = false, onNotify }) {
  const { token, isAuthenticated } = useAuth()
  const [liked, setLiked] = useState(false)

  const productId = getProductId(product)

  const soldCount = product?.soldQuantity || 
                    (product?.variants || []).reduce((acc, v) => acc + (v.soldQuantity || 0), 0)

  const formattedSold = soldCount >= 1000000 
    ? (soldCount / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'
    : soldCount >= 1000 
      ? (soldCount / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
      : soldCount

  useEffect(() => {
    // Nếu chưa đăng nhập, dùng tạm LocalStorage như cũ làm dự phòng
    if (!isAuthenticated || !productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLiked(wishlist.some((item) => getProductId(item) === productId))
      return
    }

    // Nếu đã đăng nhập, lấy trạng thái thực từ Database qua API
    const checkWishlistStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const res = await fetch(`${API_URL}/api/wishlist/${productId}/status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const status = await res.json()
          setLiked(status)
        }
      } catch (err) { console.error("Lỗi đồng bộ yêu thích:", err) }
    }
    checkWishlistStatus()
  }, [productId, isAuthenticated, token])

  async function handleToggleWishlist(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (!productId) return

    // Yêu cầu đăng nhập mới được lưu vào Database
    if (!isAuthenticated) {
      if (onNotify) onNotify('Vui lòng đăng nhập để yêu thích sản phẩm!')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const res = await fetch(`${API_URL}/api/wishlist/${productId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Không thể cập nhật danh sách yêu thích.')

      const newLikedStatus = !liked
      setLiked(newLikedStatus)

      // Cập nhật LocalStorage và bắn Event để đồng bộ UI toàn ứng dụng
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const updatedWishlist = newLikedStatus 
        ? [...wishlist, product] 
        : wishlist.filter((item) => getProductId(item) !== productId)

      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      window.dispatchEvent(new Event('wishlistUpdated'))
      
      if (onNotify) {
        onNotify(newLikedStatus 
          ? `Đã thêm ${getProductName(product)} vào danh sách yêu thích!` 
          : 'Đã bỏ yêu thích sản phẩm.'
        )
      }
    } catch (err) {
      if (onNotify) onNotify(err.message)
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      
      <Link to={`/products/${productId}`} className="flex h-full flex-col">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="aspect-square w-full object-cover"
        />

        <div className="flex flex-1 flex-col p-5">
          <h3
            className={`line-clamp-2 text-ink group-hover:text-sky-700 transition-colors ${
              compact
                ? 'min-h-[48px] text-base font-semibold leading-6'
                : 'min-h-[64px] text-xl font-bold'
            }`}
          >
            {getProductName(product)}
          </h3>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatCurrency(getProductPrice(product))}
          </p>
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 px-5 pb-5">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Đã bán {formattedSold}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all shrink-0 ${
            liked 
              ? 'bg-red-50 border-red-100 text-red-500 shadow-sm' 
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-red-500 hover:border-red-100'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[18px]" 
            style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </span>
          <span className="text-[11px] font-bold">Yêu thích</span>
        </button>
      </div>
    </article>
  )
}

export default ProductCard