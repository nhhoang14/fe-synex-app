import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminCategoriesPage() {
  usePageTitle('Quản lý Danh mục')
  
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchCategories() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const response = await fetch(`${API_URL}/api/admin/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw new Error('Không thể tải danh sách danh mục')
        const data = await response.json()
        if (active) setCategories(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (token) fetchCategories()
    return () => { active = false }
  }, [token])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Danh mục</h1>
          <p className="mt-2 text-gray-600">Phân loại sản phẩm theo loại phụ kiện (Tai nghe, Sạc dự phòng, Cáp sạc, ...)</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm danh mục
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-gray-500">Đang tải danh mục...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">Chưa có danh mục nào.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id || category.name}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name || category.categoryName}</h3>
                  <p className="mt-1 text-sm text-gray-600">{category.description || 'Mô tả danh mục'}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 transition" title="Chỉnh sửa">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button className="text-red-600 hover:text-red-700 transition" title="Xóa">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminCategoriesPage