import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart()
  const [message, setMessage] = useState('')

  const productId = getProductId(product)

  async function handleAddToCart() {
    if (!productId) {
      setMessage('Không tìm thấy product id')
      return
    }

    try {
      await addToCart(productId, 1)
      setMessage('Đã thêm vào giỏ')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <img
        src={getProductImage(product)}
        alt={getProductName(product)}
        className="aspect-[4/3] w-full object-cover"
      />

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={`line-clamp-2 text-ink ${
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

        <div className="mt-auto flex justify-center pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-800"
          >
            Thêm vào giỏ
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-muted">{message}</p>}
      </div>
    </article>
  )
}

export default ProductCard