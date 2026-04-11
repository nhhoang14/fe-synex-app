import { useEffect, useMemo, useState } from 'react'
import PageBanner from '../components/PageBanner'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../services/orderService'
import { getMyAddresses } from '../services/userService'
import {
  formatCurrency,
  getAddressLabel,
  getCartItemProduct,
  getCartItemQuantity,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function CheckoutPage() {
  const { token } = useAuth()
  const { items, totalAmount, fetchCart } = useCart()

  const [addresses, setAddresses] = useState([])
  const [message, setMessage] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    note: '',
    shippingAddressId: '',
    paymentMethod: 'COD',
  })

  useEffect(() => {
    fetchCart().catch(() => {
      setMessage('Không tai được gio hang')
    })

    getMyAddresses(token)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setAddresses(list)
        const defaultAddress = list.find((address) => address.isDefault)
        if (defaultAddress) {
          setForm((prev) => ({
            ...prev,
            shippingAddressId: String(defaultAddress.id),
            fullName: defaultAddress.fullName || prev.fullName,
            phoneNumber: defaultAddress.phoneNumber || prev.phoneNumber,
          }))
        }
      })
      .catch(() => {
        setAddresses([])
      })
  }, [fetchCart, token])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getCartItemProduct(item)
      return sum + getCartItemQuantity(item) * getProductPrice(product)
    }, 0)
  }, [items])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setPlacingOrder(true)

    try {
      const payload = {
        paymentMethod: form.paymentMethod,
      }

      if (form.shippingAddressId) {
        payload.shippingAddressId = Number(form.shippingAddressId)
      }

      await createOrder(token, payload)
      setMessage('Đặt đơn thanh cong')
      await fetchCart()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="page-stack">
      <PageBanner title="Trang thanh toan" subtitle="Xac nhan thong tin va dat don hang." />

      <section className="checkout-mvp-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Form thong tin thanh toan</h2>
          <label className="form-field" htmlFor="fullName">
            <span>Ho va ten</span>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field" htmlFor="phoneNumber">
            <span>So dien thoai</span>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field" htmlFor="shippingAddressId">
            <span>Dia chi giao hang</span>
            <select
              id="shippingAddressId"
              name="shippingAddressId"
              value={form.shippingAddressId}
              onChange={handleChange}
            >
              <option value="">Dung dia chi mặc định</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.fullName} - {getAddressLabel(address)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field" htmlFor="paymentMethod">
            <span>Phuong thuc thanh toan</span>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
            >
              <option value="COD">COD</option>
              <option value="CARD">CARD</option>
            </select>
          </label>

          <label className="form-field" htmlFor="note">
            <span>Ghi chu</span>
            <textarea id="note" name="note" value={form.note} onChange={handleChange} rows={3} />
          </label>

          <button type="submit" disabled={placingOrder || items.length === 0}>
            {placingOrder ? 'Đang đặt đơn...' : 'Đặt đơn'}
          </button>
          {message && <p className="hint">{message}</p>}
        </form>

        <aside className="section-block order-summary-box">
          <h3>Order detail</h3>
          <div className="order-items-preview">
            {items.length === 0 ? (
              <p>Giỏ hàng trong.</p>
            ) : (
              items.map((item) => {
                const product = getCartItemProduct(item)
                const quantity = getCartItemQuantity(item)
                const price = getProductPrice(product)

                return (
                  <p key={item.id || `${getProductName(product)}-${quantity}`}>
                    {getProductName(product)} x{quantity} - {formatCurrency(price * quantity)}
                  </p>
                )
              })
            )}
          </div>

          <hr />
          <p>Tạm tính: {formatCurrency(subtotal)}</p>
          <p>Thanh toan: {formatCurrency(totalAmount || subtotal)}</p>
        </aside>
      </section>
    </div>
  )
}

export default CheckoutPage
