import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getMyOrders } from '../services/orderService'

function AdminOrdersPage() {
  usePageTitle('Quan ly don hang - Synex')

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

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">ADMIN / ORDERS</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Quan ly don hang</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Khu don hang doc lap trong admin. Neu backend tra ve danh sach don hang cho admin,
          trang nay se hien thi truc tiep.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tong don hang</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : orders.length}</strong>
        </article>
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Don hien thi</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : latestOrders.length}</strong>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Danh sach don hang</h2>
        <div className="mt-4 space-y-3">
          {latestOrders.length === 0 ? (
            <p className="text-slate-600">Chua co du lieu don hang.</p>
          ) : (
            latestOrders.map((order, index) => (
              <article key={order.id || order.orderId || `admin-order-${index}`} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-ink">Don hang #{order.id || order.orderId || index + 1}</strong>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                    {String(order.status || order.orderStatus || 'PENDING')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {order.totalAmount || order.totalPrice || order.amount || 0}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminOrdersPage
