import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getMyOrders } from '../services/orderService'

function AdminOrdersPage() {
  usePageTitle('Quản lý đơn hàng - Synex')

  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrapOrders() {
      setLoading(true)

      try {
        const data = await getMyOrders(token)
        if (!active) return
        setOrders(Array.isArray(data) ? data : [])
      } catch {
        if (!active) return
        setOrders([])
      } finally {
        if (active) setLoading(false)
      }
    }

    bootstrapOrders()

    return () => {
      active = false
    }
  }, [token])

  const latestOrders = useMemo(() => orders.slice(0, 8), [orders])

  function formatOrderMoney(value) {
    const amount = Number(value || 0)
    return amount.toLocaleString('vi-VN') + ' đ'
  }

  function getOrderTotal(order) {
    return order.totalAmount || order.totalPrice || order.amount || order.total || 0
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          ADMIN / ORDERS
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
          Quản lý đơn hàng
        </h1>

        <p className="mt-3 max-w-2xl text-slate-700">
          Khu đơn hàng độc lập trong admin. Nếu backend trả về danh sách đơn hàng cho admin,
          trang này sẽ hiển thị trực tiếp.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng đơn hàng</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : orders.length}
          </strong>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Đơn hiển thị</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : latestOrders.length}
          </strong>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Trang admin</p>
          <Link to={ROUTES.ADMIN} className="mt-2 inline-flex font-semibold text-sky-700">
            Quay lại dashboard
          </Link>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Danh sách đơn hàng</h2>

        <div className="mt-4 space-y-3">
          {latestOrders.length === 0 ? (
            <p className="text-slate-600">Chưa có dữ liệu đơn hàng.</p>
          ) : (
            latestOrders.map((order, index) => {
              const orderId = order.id || order.orderId || index + 1
              const status = String(order.status || order.orderStatus || 'PENDING')
              const total = getOrderTotal(order)

              return (
                <article
                  key={order.id || order.orderId || `admin-order-${index}`}
                  className="rounded-2xl border border-border bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-ink">Đơn hàng #{orderId}</strong>

                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                      {status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-700">
                    Tổng tiền: {formatOrderMoney(total)}
                  </p>
                </article>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminOrdersPage