import { useEffect, useMemo, useState } from 'react'
import PageBanner from '../components/PageBanner'
import { PAYMENT_METHODS } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
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
  usePageTitle('Thanh toán - Synex')

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
    paymentMethod: PAYMENT_METHODS[0].value,
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
    <div className="space-y-4">
      <PageBanner title="Trang thanh toan" subtitle="Xac nhan thong tin va dat don hang." />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-ink">Form thong tin thanh toan</h2>
          <label className="block space-y-2" htmlFor="fullName">
            <span className="text-sm font-medium text-ink">Ho va ten</span>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="block space-y-2" htmlFor="phoneNumber">
            <span className="text-sm font-medium text-ink">So dien thoai</span>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="block space-y-2" htmlFor="shippingAddressId">
            <span className="text-sm font-medium text-ink">Dia chi giao hang</span>
            <select
              id="shippingAddressId"
              name="shippingAddressId"
              value={form.shippingAddressId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="">Dung dia chi mặc định</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.fullName} - {getAddressLabel(address)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2" htmlFor="paymentMethod">
            <span className="text-sm font-medium text-ink">Phuong thuc thanh toan</span>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2" htmlFor="note">
            <span className="text-sm font-medium text-ink">Ghi chu</span>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <button
            type="submit"
            disabled={placingOrder || items.length === 0}
            className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? 'Đang đặt đơn...' : 'Đặt đơn'}
          </button>
          {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
        </form>

        <aside className="h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-ink">Order detail</h3>
          <div className="mt-4 space-y-2">
            {items.length === 0 ? (
              <p className="text-slate-600">Giỏ hàng trong.</p>
            ) : (
              items.map((item) => {
                const product = getCartItemProduct(item)
                const quantity = getCartItemQuantity(item)
                const price = getProductPrice(product)

                return (
                  <p key={item.id || `${getProductName(product)}-${quantity}`} className="text-slate-700">
                    {getProductName(product)} x{quantity} - {formatCurrency(price * quantity)}
                  </p>
                )
              })
            )}
          </div>

          <hr className="my-4 border-border" />
          <p className="flex items-center justify-between text-slate-700">
            <span>Tạm tính:</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </p>
          <p className="mt-2 flex items-center justify-between text-lg font-bold text-ink">
            <span>Thanh toan:</span>
            <strong>{formatCurrency(totalAmount || subtotal)}</strong>
          </p>
        </aside>
      </section>
    </div>
  )
}

export default CheckoutPage
