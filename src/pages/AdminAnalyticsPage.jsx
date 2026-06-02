import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminAnalyticsPage() {
  usePageTitle('Thống kê & Báo cáo')

  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0
  })

  useEffect(() => {
    let active = true
    async function fetchOrderStats() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const response = await fetch(`${API_URL}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        
        if (active && Array.isArray(data)) {
          const totalOrders = data.length
          const totalRevenue = data.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0)
          const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0

          setStats({ totalRevenue, totalOrders, avgOrderValue })
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu đơn hàng thống kê', error)
      }
    }

    if (token) fetchOrderStats()
    return () => { active = false }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Thống kê & Báo cáo</h1>
        <p className="mt-2 text-gray-600">Báo cáo doanh thu, sản phẩm bán chạy nhất, phân tích chi tiết kinh doanh</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input type="date" className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
        <span className="flex items-center text-gray-600">đến</span>
        <input type="date" className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
          Lọc
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</p>
          <p className="mt-1 text-sm text-green-600">Cập nhật theo dữ liệu thực</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="mt-1 text-sm text-green-600">Cập nhật theo dữ liệu thực</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Giá Trị Đơn TB</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round(stats.avgOrderValue).toLocaleString('vi-VN')} ₫</p>
          <p className="mt-1 text-sm text-green-600">Cập nhật theo dữ liệu thực</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tỷ Lệ Hoàn Trả</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0%</p>
          <p className="mt-1 text-sm text-gray-500">Chưa có dữ liệu đổi trả</p>
        </div>
      </div>

      {/* Dữ liệu sản phẩm bán chạy/Thương hiệu tạm thời giữ giao diện để chờ API phân tích tương lai */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Sản Phẩm Bán Chạy Nhất</h2>
          <div className="mt-4 flex h-48 items-center justify-center bg-gray-50 rounded-lg text-gray-500">
            Dữ liệu đang được thu thập...
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Doanh Thu Theo Thương Hiệu</h2>
          <div className="mt-4 flex h-48 items-center justify-center bg-gray-50 rounded-lg text-gray-500">
             Dữ liệu đang được thu thập...
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage