import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductCard({ product, compact = false, onNotify }) {
  const { addToCart } = useCart()
  const [liked, setLiked] = useState(false)

  const productId = getProductId(product)

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLiked(wishlist.some((item) => getProductId(item) === productId))
  }, [productId])

  async function handleAddToCart(event) {
    // Ngăn chặn sự kiện click lan ra thẻ Link bọc bên ngoài
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (!productId) return

    try {
      await addToCart(productId, 1)
      if (onNotify) onNotify(`Đã thêm ${getProductName(product)} vào giỏ hàng thành công!`)
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ:', error)
      if (onNotify) onNotify(error.message || 'Không thể thêm vào giỏ hàng')
      else alert(error.message || 'Không thể thêm vào giỏ hàng')
    }
  }

  function handleToggleWishlist(event) {
    // Ngăn chặn sự kiện click lan ra thẻ Link bọc bên ngoài
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
      
      {/* Nút Thả tim */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/90 text-2xl opacity-0 shadow-sm transition hover:scale-105 group-hover:opacity-100"
      >
        <span className={liked ? 'text-red-500' : 'text-slate-500'}>
          {liked ? '♥' : '♡'}
        </span>
      </button>

      {/* Link bọc Ảnh và Tên Sản phẩm */}
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

      {/* Nút Thêm vào giỏ nằm ngoài thẻ Link */}
      <div className="mt-auto flex justify-center pb-5 px-5">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-800"
        >
          Thêm vào giỏ
        </button>
      </div>
    </article>
  )
}

export default ProductCard