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
    <article className="product-card">
      <img src={getProductImage(product)} alt={getProductName(product)} />
      <div className="product-content">
        <h3>{getProductName(product)}</h3>
        <p className="price">{formatCurrency(getProductPrice(product))}</p>
        <div className="row">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
          <button type="button" onClick={handleAddToCart}>
            Thêm vào giỏ
          </button>
        </div>
        {message && <p className="hint">{message}</p>}
      </div>
    </article>
  )
}

export default ProductCard
