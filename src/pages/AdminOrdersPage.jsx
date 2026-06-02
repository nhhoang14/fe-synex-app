import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

function AdminOrdersPage() {
  usePageTitle('Quản lý đơn hàng - Synex')

  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchAdminOrders() {
      setLoading(true)
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        // Gọi API Admin Orders để lấy TOÀN BỘ đơn hàng của hệ thống
        const response = await fetch(`${API_URL}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        if (active) setOrders(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        if (active) setOrders([])
      } finally {
        if (active) setLoading(false)
      }
    }

    if (token) fetchAdminOrders()

    return () => { active = false }
  }, [token])

  // Hiển thị tối đa 50 đơn hàng gần nhất
  const latestOrders = useMemo(() => orders.slice(0, 50), [orders])

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
          Khu vực quản lý và cập nhật trạng thái đơn hàng của tất cả khách hàng trên hệ thống.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng số đơn hàng</p>
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
        <h2 className="text-2xl font-bold text-ink">Danh sách đơn hàng toàn hệ thống</h2>

        <div className="mt-4 space-y-3">
          {loading ? (
             <p className="text-slate-600">Đang tải dữ liệu đơn hàng...</p>
          ) : latestOrders.length === 0 ? (
            <p className="text-slate-600">Hệ thống chưa có đơn hàng nào.</p>
          ) : (
            latestOrders.map((order, index) => {
              const orderId = order.orderCode || order.id || index + 1
              const status = String(order.status || order.orderStatus || 'PENDING')
              const total = getOrderTotal(order)

              return (
                <article
                  key={order.id || `admin-order-${index}`}
                  className="rounded-2xl border border-border bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-ink">Đơn hàng #{orderId} - {order.receiverName || 'Khách hàng'}</strong>

                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-white text-slate-700 border border-border'
                      }`}>
                      {status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-700">
                    Tổng tiền: <strong className="text-ink">{formatOrderMoney(total)}</strong>
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