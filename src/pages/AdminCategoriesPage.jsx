import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminCategoriesPage() {
  usePageTitle('Quản lý Danh mục')
  
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State quản lý form Thêm/Sửa (Đã đổi sang dùng URL ảnh)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', imageUrl: '' })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Không thể tải danh sách danh mục')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchCategories()
  }, [token])

  const handleOpenAdd = () => {
    setEditingId(null)
    setCategoryForm({ name: '', imageUrl: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category) => {
    setEditingId(category.id)
    setCategoryForm({ 
      name: category.name || category.categoryName || '',
      imageUrl: category.imageUrl || category.image || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const url = editingId ? `${API_URL}/api/admin/categories/${editingId}` : `${API_URL}/api/admin/categories`
      const method = editingId ? 'PUT' : 'POST'

      // FIX LỖI BLANK: Phải gửi JSON thuần túy vì API Category không hỗ trợ multipart
      const payload = {
        name: categoryForm.name,
        imageUrl: categoryForm.imageUrl,
        image: categoryForm.imageUrl // Gửi dự phòng cả 2 key ảnh
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Lưu danh mục thất bại')
      }

      alert(editingId ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới')
      setIsModalOpen(false)
      fetchCategories()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Xóa thất bại')
      alert('Đã xóa danh mục')
      fetchCategories()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
        <button onClick={handleOpenAdd} className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-full font-semibold transition flex items-center gap-2">
          <span className="material-symbols-outlined">add</span> Thêm danh mục
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="text-gray-500">Đang tải danh mục...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">Chưa có danh mục nào.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id || category.name}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <div className="h-40 bg-slate-100 relative">
                {category.imageUrl || category.image ? (
                  <img src={category.imageUrl || category.image} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl">image</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{category.name || category.categoryName}</h3>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 justify-end">
                  <button onClick={() => handleOpenEdit(category)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="Chỉnh sửa">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition" title="Xóa">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tên danh mục <span className="text-red-500">*</span></label>
                <input required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-sky-500" placeholder="VD: Ốp lưng" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Link Hình ảnh (URL)</label>
                <input 
                  type="url" 
                  value={categoryForm.imageUrl} 
                  onChange={e => setCategoryForm({...categoryForm, imageUrl: e.target.value})} 
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-sky-500" 
                  placeholder="https://example.com/image.png" 
                />
                <p className="text-xs text-slate-500 mt-1">Dán địa chỉ (URL) hình ảnh vào đây để hiển thị ở trang chủ.</p>
              </div>

              {/* Xem trước ảnh nếu có Link */}
              {categoryForm.imageUrl && (
                <div className="h-40 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                   <img src={categoryForm.imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border rounded-full py-3 font-bold text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white rounded-full py-3 font-bold hover:bg-slate-800">Lưu danh mục</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesPage