import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  const productId = getProductId(product)
  const productLink = `/products/${productId}`

  async function handleAddToCart() {
    if (!productId) {
      setMessage('Không tìm thấy product id')
      return
    }

    try {
      await addToCart(productId, Math.max(1, Number(quantity) || 1))
      setMessage('Đã thêm vào giỏ hàng')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link to={productLink} className="block">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="min-h-[64px] text-xl font-bold leading-snug text-ink">
          <Link to={productLink} className="hover:text-sky-700">
            {getProductName(product)}
          </Link>
        </h3>

        <p className="mt-2 text-lg font-semibold text-slate-900">
          {formatCurrency(getProductPrice(product))}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
              className="w-20 rounded-2xl border border-border bg-white px-3 py-2 text-center outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Thêm vào giỏ
            </button>
          </div>

          {message && <p className="mt-3 text-sm text-muted">{message}</p>}
        </div>
      </div>
    </article>
  )
}

export default ProductCard