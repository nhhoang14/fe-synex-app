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
      setMessage('Không tải được giỏ hàng')
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

    if (name === 'shippingAddressId') {
      const selectedAddress = addresses.find(
        (address) => String(address.id) === String(value),
      )

      setForm((prev) => ({
        ...prev,
        shippingAddressId: value,
        fullName: selectedAddress?.fullName || prev.fullName,
        phoneNumber: selectedAddress?.phoneNumber || prev.phoneNumber,
      }))

      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (items.length === 0) {
      setMessage('Giỏ hàng đang trống')
      return
    }

    setPlacingOrder(true)

    try {
      const payload = {
        paymentMethod: form.paymentMethod,
      }

      if (form.shippingAddressId) {
        payload.shippingAddressId = Number(form.shippingAddressId)
      }

      await createOrder(token, payload)
      setMessage('Đặt đơn thành công')
      await fetchCart()
    } catch (error) {
      setMessage(error.message || 'Đặt đơn thất bại')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageBanner
        title="Trang thanh toán"
        subtitle="Xác nhận thông tin và đặt đơn hàng."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form
          className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-ink">Thông tin thanh toán</h2>

          <label className="block space-y-2" htmlFor="fullName">
            <span className="text-sm font-medium text-ink">Họ và tên</span>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên người nhận"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="block space-y-2" htmlFor="phoneNumber">
            <span className="text-sm font-medium text-ink">Số điện thoại</span>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              placeholder="Nhập số điện thoại"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="block space-y-2" htmlFor="shippingAddressId">
            <span className="text-sm font-medium text-ink">Địa chỉ giao hàng</span>
            <select
              id="shippingAddressId"
              name="shippingAddressId"
              value={form.shippingAddressId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="">Dùng địa chỉ mặc định</option>

              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.fullName} - {getAddressLabel(address)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2" htmlFor="paymentMethod">
            <span className="text-sm font-medium text-ink">Phương thức thanh toán</span>
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
            <span className="text-sm font-medium text-ink">Ghi chú</span>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="Ghi chú thêm cho đơn hàng nếu có"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <button
            type="submit"
            disabled={placingOrder || items.length === 0}
            className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? 'Đang đặt đơn...' : 'Đặt đơn hàng'}
          </button>

          {message && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {message}
            </p>
          )}
        </form>

        <aside className="h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-ink">Chi tiết đơn hàng</h3>

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-slate-600">Giỏ hàng trống.</p>
            ) : (
              items.map((item) => {
                const product = getCartItemProduct(item)
                const quantity = getCartItemQuantity(item)
                const price = getProductPrice(product)

                return (
                  <div
                    key={item.id || `${getProductName(product)}-${quantity}`}
                    className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    <p className="font-semibold text-ink">{getProductName(product)}</p>
                    <p className="mt-1">
                      Số lượng: {quantity} × {formatCurrency(price)}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      Thành tiền: {formatCurrency(price * quantity)}
                    </p>
                  </div>
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
            <span>Thanh toán:</span>
            <strong>{formatCurrency(totalAmount || subtotal)}</strong>
          </p>
        </aside>
      </section>
    </div>
  )
}

export default CheckoutPage