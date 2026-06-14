import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductCard({ product, compact = false, onNotify }) {
  const [liked, setLiked] = useState(false)

  const productId = getProductId(product)

  // Rút gọn số lượng đã bán theo hàng đơn vị (k cho nghìn, m cho triệu) để tiết kiệm diện tích
  const soldCount = product?.soldQuantity || product?.sold || 0
  const formattedSold = soldCount >= 1000000 
    ? (soldCount / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'
    : soldCount >= 1000 
      ? (soldCount / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
      : soldCount

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLiked(wishlist.some((item) => getProductId(item) === productId))
  }, [productId])

  function handleToggleWishlist(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (!productId) return

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const exists = wishlist.some((item) => getProductId(item) === productId)

    let newWishlist

    if (exists) {
      newWishlist = wishlist.filter((item) => getProductId(item) !== productId)
      setLiked(false)
      if (onNotify) onNotify('Đã bỏ thích sản phẩm.')
    } else {
      newWishlist = [...wishlist, product]
      setLiked(true)
      if (onNotify) onNotify(`Đã thêm ${getProductName(product)} vào sản phẩm đã thích!`)
    }

    localStorage.setItem('wishlist', JSON.stringify(newWishlist))
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      
      <Link to={`/products/${productId}`} className="flex h-full flex-col">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="aspect-[4/3] w-full object-cover"
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