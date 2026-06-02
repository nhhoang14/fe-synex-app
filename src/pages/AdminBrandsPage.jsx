import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminBrandsPage() {
  usePageTitle('Quản lý Thương hiệu')
  
  const { token } = useAuth()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchBrands() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const response = await fetch(`${API_URL}/api/admin/brands`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw new Error('Không thể tải danh sách thương hiệu')
        const data = await response.json()
        if (active) setBrands(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (token) fetchBrands()
    return () => { active = false }
  }, [token])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Thương hiệu</h1>
          <p className="mt-2 text-gray-600">Quản lý danh sách các hãng đối tác (Apple, Samsung, Anker, Baseus, Logitech...)</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm thương hiệu
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Thương hiệu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mô tả / Quốc gia</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Chưa có thương hiệu nào.</td></tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id || brand.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name || brand.brandName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{brand.description || brand.country || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 transition" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button className="text-red-600 hover:text-red-700 transition" title="Xóa">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
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

export default AdminBrandsPage