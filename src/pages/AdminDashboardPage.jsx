import { useEffect, useState, useMemo } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminDashboardPage() {
  usePageTitle('Bảng điều khiển')

  const { token } = useAuth()
  const [metrics, setMetrics] = useState({ revenue: 0, ordersCount: 0, usersCount: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [allOrders, setAllOrders] = useState([]) // Lưu trữ toàn bộ đơn hàng phục vụ xử lý số liệu
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

          setAllOrders(validOrders)

          // Giữ nguyên logic tính toán KPI Metrics gốc của bạn
          const totalRevenue = validOrders.reduce((sum, order) => {
            if (order.status !== 'CANCELLED') {
              return sum + (order.totalAmount || order.totalPrice || 0)
            }
            return sum
          }, 0)

          setMetrics({
            revenue: totalRevenue,
            ordersCount: validOrders.length,
            usersCount: validUsers.length
          })

          setRecentOrders(validOrders.slice(0, 5))
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu dashboard:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
    return () => {
      active = false
    }
  }, [token])

  // Logic dữ liệu doanh thu cho 5 tháng gần nhất
  const revenueChartData = useMemo(() => {
    const monthsData = Array.from({ length: 5 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return {
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
        revenue: 0
      }
    }).reverse()

    allOrders.forEach(order => {
      if (order.status === 'CANCELLED') return
      const orderDate = new Date(order.createdAt || order.orderDate)
      const m = orderDate.getMonth() + 1
      const y = orderDate.getFullYear()

      const matchedMonth = monthsData.find(item => item.month === m && item.year === y)
      if (matchedMonth) {
        matchedMonth.revenue += (order.totalAmount || order.totalPrice || 0)
      }
    })

    const maxRevenue = Math.max(...monthsData.map(o => o.revenue), 1)

    return monthsData.map(item => ({
      ...item,
      percentage: (item.revenue / maxRevenue) * 100
    }))
  }, [allOrders])

  // Logic thống kê Top 10 sản phẩm bán chạy nhất trong tháng hiện tại
  const topProductsOfMonth = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const productMap = {}

    allOrders.forEach(order => {
      if (order.status === 'CANCELLED') return
      const orderDate = new Date(order.createdAt || order.orderDate)
      
      if (orderDate.getMonth() + 1 === currentMonth && orderDate.getFullYear() === currentYear) {
        const items = order.orderItems || order.items || []
        items.forEach(item => {
          const pName = item.productName || 
                        (item.product && item.product.name) || 
                        (item.variant && item.variant.product && item.variant.product.name) || 
                        'Sản phẩm không tên'
          const qty = item.quantity || 0
          const price = item.price || 0

          if (!productMap[pName]) {
            productMap[pName] = { name: pName, quantity: 0, totalSales: 0 }
          }
          productMap[pName].quantity += qty
          productMap[pName].totalSales += (qty * price)
        })
      }
    })

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
  }, [allOrders])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
      </div>

      {/* Giữ nguyên vẹn 3 khối KPI gốc (Tổng doanh thu, Đơn hàng, Người dùng) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.revenue.toLocaleString('vi-VN')} ₫</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.ordersCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Người dùng</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.usersCount}</p>
        </div>
      </div>

      {/* Thay đổi hệ thống lưới sang 5 cột để chia không gian theo tỉ lệ 2:3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        
        {/* Khối 1: Biểu đồ doanh thu 5 tháng gần nhất (Chiếm 2/5 phần chiều ngang) */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Biểu đồ doanh thu 5 tháng gần nhất</h2>
          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-gray-100">
            {revenueChartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip nhỏ khi di chuột vào cột */}
                <div className="absolute -top-4 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap shadow-sm z-10">
                  {item.revenue.toLocaleString('vi-VN')} ₫
                </div>
                {/* Thanh đồ thị */}
                <div 
                  style={{ height: `${Math.max(item.percentage, 5)}%` }}
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-colors cursor-pointer"
                ></div>
                <span className="text-[11px] text-gray-400 font-medium mt-1.5 truncate w-full text-center">
                  Tháng {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Khối 2: Bảng Top 10 sản phẩm bán chạy nhất trong tháng (Chiếm 3/5 phần chiều ngang) */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between lg:col-span-3">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Top 10 sản phẩm bán chạy nhất trong tháng</h2>
          <div className="overflow-y-auto max-h-48 pr-1 w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 w-10 text-center">Top</th>
                  <th className="pb-2">Tên sản phẩm</th>
                  <th className="pb-2 text-center w-16">SL</th>
                  <th className="pb-2 text-right w-24">Doanh số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {topProductsOfMonth.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="py-2 text-center font-bold text-gray-500">{index + 1}</td>
                    <td className="py-2 font-medium text-gray-900 truncate max-w-[200px]" title={item.name}>
                      {item.name}
                    </td>
                    <td className="py-2 text-center text-gray-600 font-semibold">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-900 font-medium">
                      {item.totalSales.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
                {topProductsOfMonth.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 italic">
                      Chưa có dữ liệu bán hàng tháng này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Giữ nguyên vẹn phần bảng đơn hàng gần đây bên dưới */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Đơn hàng mới nhận gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Giá trị</th>
                <th className="px-4 py-3">Trạng thái</th>
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
                        {order.status}
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