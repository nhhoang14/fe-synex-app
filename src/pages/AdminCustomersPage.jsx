import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminCustomersPage() {
  usePageTitle('Quản lý Khách hàng')

  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchUsers() {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Lỗi tải danh sách người dùng')
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [token])

  async function handleDeleteUser(id) {
    if (!window.confirm('Bạn có chắc chắn muốn khóa/xóa tài khoản này?')) return
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Thao tác thất bại')
      fetchUsers()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Khách hàng</h1>
          <p className="mt-2 text-gray-600">Danh sách tài khoản khách hàng, lịch sử mua hàng và quản lý trạng thái</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm khách hàng
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Khóa</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Khách Hàng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số Điện Thoại</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vai Trò</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Chưa có khách hàng nào.</td></tr>
              ) : (
                users.map((customer) => (
                  <tr key={customer.id || customer.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{customer.fullName || customer.name || 'Người dùng'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phoneNumber || customer.phone || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{customer.role || 'USER'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 transition" title="Xem chi tiết">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(customer.id)}
                          className="text-red-600 hover:text-red-700 transition" 
                          title="Khóa tài khoản"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                        </button>
                      </div>
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

export default AdminCustomersPage