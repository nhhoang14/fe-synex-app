import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getMyOrders } from '../services/orderService'
import { formatCurrency } from '../utils/normalizers'

function OrdersPage() {
  usePageTitle('Đơn hàng của tôi - Synex')

  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function bootstrapOrders() {
      setLoading(true)
      try {
        const data = await getMyOrders(token)
        if (!active) return
        setOrders(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!active) return
        setOrders([])
        setMessage(error.message || 'Không tải được đơn hàng')
      } finally {
        if (active) setLoading(false)
      }
    }

    bootstrapOrders()

    return () => {
      active = false
    }
  }, [token])

  const totalOrders = useMemo(() => orders.length, [orders])

  function formatOrderDate(order) {
    const rawDate = order?.createdAt || order?.orderDate || order?.createdDate || order?.updatedAt
    if (!rawDate) return 'Chưa có ngày'

    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return 'Chưa có ngày'

    return date.toLocaleDateString('vi-VN')
  }

  function formatOrderLabel(order) {
    return String(order?.status || order?.orderStatus || 'PENDING')
  }

  function formatOrderTotal(order) {
    return order?.totalAmount || order?.totalPrice || order?.amount || 0
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">USER / ORDERS</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Đơn hàng của tôi</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Trang xem đơn riêng, mở từ icon người dùng, không nằm trong hồ sơ.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng đơn</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : totalOrders}</strong>
        </article>
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm md:col-span-2">
          <p className="text-sm font-medium text-slate-600">Điều hướng nhanh</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link to={ROUTES.ACCOUNT} className="rounded-full border border-border bg-white px-4 py-2 font-semibold text-ink transition hover:bg-slate-50">
              Hồ sơ cá nhân
            </Link>
            <Link to={ROUTES.PRODUCTS} className="rounded-full border border-border bg-white px-4 py-2 font-semibold text-ink transition hover:bg-slate-50">
              Xem sản phẩm
            </Link>
          </div>
        </article>
      </section>

      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Danh sách đơn hàng</h2>
        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-slate-600">Đang tải đơn hàng...</p>
          ) : orders.length === 0 ? (
            <p className="text-slate-600">Bạn chưa có đơn hàng nào.</p>
          ) : (
            orders.map((order, index) => {
              const orderId = order?.id || order?.orderId || `order-${index + 1}`

              return (
                <article key={orderId} className="rounded-2xl border border-border bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="block text-ink">Đơn hàng #{orderId}</strong>
                      <p className="mt-1 text-sm text-slate-600">Ngày tạo: {formatOrderDate(order)}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                      {formatOrderLabel(order)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
                    <span>Tổng tiền</span>
                    <strong className="text-ink">{formatCurrency(formatOrderTotal(order))}</strong>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

export default OrdersPage
