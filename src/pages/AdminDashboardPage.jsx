import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminDashboardPage() {
  usePageTitle('Bảng điều khiển')

  const { token } = useAuth()
  const [metrics, setMetrics] = useState({ revenue: 0, ordersCount: 0, usersCount: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchDashboardData() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const [ordersRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (active) {
          const orders = ordersRes.ok ? await ordersRes.json() : []
          const users = usersRes.ok ? await usersRes.json() : []

          const validOrders = Array.isArray(orders) ? orders : []
          const validUsers = Array.isArray(users) ? users : []

          const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0)
          
          setMetrics({
            revenue: totalRevenue,
            ordersCount: validOrders.length,
            usersCount: validUsers.length
          })

          // Lấy 5 đơn mới nhất
          setRecentOrders(validOrders.slice(0, 5))
        }
      } catch (error) {
        console.error('Dashboard Data Error:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (token) fetchDashboardData()
    return () => { active = false }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bảng điều khiển</h1>
        <p className="mt-2 text-gray-600">Xem nhanh các chỉ số quan trọng và tình hình kinh doanh</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng Doanh Thu', value: `${metrics.revenue.toLocaleString('vi-VN')} ₫`, change: 'Dữ liệu thực', icon: 'trending_up' },
          { label: 'Đơn Hàng Tổng', value: metrics.ordersCount, change: 'Dữ liệu thực', icon: 'shopping_cart' },
          { label: 'Tổng Khách Hàng', value: metrics.usersCount, change: 'Dữ liệu thực', icon: 'person_add' },
          { label: 'Tỷ Lệ Hoàn Trả', value: '0%', change: 'Chưa có dữ liệu', icon: 'trending_up' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{loading ? '...' : metric.value}</p>
                <p className="mt-1 text-sm text-green-600">{metric.change}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <span className="material-symbols-outlined text-blue-600">{metric.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Biểu Đồ Doanh Thu</h2>
          <div className="mt-4 h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Dữ liệu biểu đồ đang được thu thập
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Biểu Đồ Tăng Trưởng</h2>
          <div className="mt-4 h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Dữ liệu biểu đồ đang được thu thập
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Đơn Hàng Gần Đây</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Mã Đơn</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Khách Hàng</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Giá Trị</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">Đang tải đơn hàng...</td></tr>
              ) : recentOrders.length === 0 ? (
                 <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">Chưa có đơn hàng nào.</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{order.orderCode || order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.receiverName || order.fullName || 'Người dùng'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(order.totalAmount || order.totalPrice || 0).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage