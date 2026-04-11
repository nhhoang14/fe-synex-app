import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import {
  formatCurrency,
  getCartItemProduct,
  getCartItemQuantity,
  getProductImage,
  getProductId,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function CartPage() {
  const { isAuthenticated } = useAuth()
  const { items, totalAmount, fetchCart, openCart, increase, decrease, remove } = useCart()
  const [message, setMessage] = useState('')

  const shippingFee = 0
  const grandTotal = totalAmount + shippingFee

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {
        setMessage('Không tai được gio hang')
      })
    }
  }, [isAuthenticated, fetchCart])

  async function ensureCart() {
    if (!isAuthenticated) {
      setMessage('Vui long dang nhap hop le de tai va cap nhat du lieu gio hang.')
      return
    }

    try {
      await openCart()
      setMessage('Da tao/lay gio hang hien tai')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleIncrease(productId) {
    if (!isAuthenticated) return

    try {
      await increase(productId, 1)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDecrease(productId) {
    if (!isAuthenticated) return

    try {
      await decrease(productId, 1)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleRemove(productId) {
    if (!isAuthenticated) return

    try {
      await remove(productId)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="cart-page-shell">
      <section className="cart-hero-grid">
        <article className="cart-hero-main">
          <p className="cart-overline">GIO HANG SYNEX</p>
          <h1>Giỏ hàng cua ban</h1>
        </article>

        <article className="cart-hero-stat">
          <p className="cart-stat-label">GIO HANG</p>
          <h2>{String(items.length).padStart(2, '0')} san pham</h2>
          <p>
            {isAuthenticated
              ? 'Ban co the tang giam so luong va xoa nhanh tung san pham trong gio.'
              : 'Can dang nhap hop le de tai va cap nhat du lieu gio hang.'}
          </p>
        </article>
      </section>

      <section className="cart-content-grid">
        <section className="cart-items-card">
          <div className="cart-items-head">
            <h2>Sản phẩm trong gio</h2>
            <div className="row cart-head-actions">
              <Link to="/products" className="ghost-link cart-soft-link">
                Tiếp tục mua sắm
              </Link>
              <button type="button" className="cart-refresh-btn" onClick={ensureCart}>
                Làm mới
              </button>
            </div>
          </div>

          {message && <p className="hint">{message}</p>}

          {items.length === 0 ? (
            <p>
              {isAuthenticated
                ? 'Giỏ hàng dang trong. Hay them san pham de tiep tuc thanh toan.'
                : 'Không tai được gio hang. Hay dang nhap truoc.'}
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const product = getCartItemProduct(item)
                  const productId = getProductId(product)
                  const quantity = getCartItemQuantity(item)
                  const price = getProductPrice(product)

                  return (
                    <tr key={item.id || `${productId}-${quantity}`}>
                      <td>
                        <div className="cart-product-cell">
                          <img
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            className="cart-product-thumb"
                          />
                          <span>{getProductName(product)}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(price)}</td>
                      <td>
                        <div className="cart-qty-inline">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => handleDecrease(productId)}
                          >
                            -
                          </button>
                          <span className="cart-qty-value">{quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => handleIncrease(productId)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>{formatCurrency(price * quantity)}</td>
                      <td>
                        <div className="row cart-item-actions">
                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() => handleRemove(productId)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        <aside className="cart-summary-card">
          <h3>Tóm tắt đơn hàng</h3>

          <div className="summary-line">
            <span>Tạm tính</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
          <div className="summary-line">
            <span>Phí vận chuyển</span>
            <strong>{formatCurrency(shippingFee)}</strong>
          </div>

          <div className="summary-total">
            <span>Tổng cộng</span>
            <strong>{formatCurrency(grandTotal)}</strong>
          </div>

          <div className="cart-summary-actions">
            <Link
              to={isAuthenticated && items.length > 0 ? '/checkout' : '/login'}
              className="primary-link cart-checkout-btn"
            >
              Tiến hành thanh toán
            </Link>

            <Link to="/products" className="ghost-link cart-continue-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default CartPage
