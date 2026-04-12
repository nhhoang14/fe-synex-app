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

  async function handleAddToCart() {
    if (!productId) {
      setMessage('Không tim thay product id')
      return
    }

    try {
      await addToCart(productId, quantity)
      setMessage('Da them vao gio hang')
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
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="text-xl font-bold text-ink">{getProductName(product)}</h3>
        <p className="text-lg font-semibold text-slate-900">{formatCurrency(getProductPrice(product))}</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
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
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>
    </article>
  )
}

export default ProductCard
