import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminBrandsPage() {
  usePageTitle('Quản lý Thương hiệu')
  
  const { token } = useAuth()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  // State quản lý Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [brandForm, setBrandForm] = useState({ name: '' })

  const fetchBrands = async () => {
    setLoading(true)
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
      setBrands(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchBrands()
  }, [token])

  // Xử lý mở form Thêm mới
  const handleOpenAdd = () => {
    setEditingId(null)
    setBrandForm({ name: '' })
    setIsModalOpen(true)
  }

  // Xử lý mở form Sửa
  const handleOpenEdit = (brand) => {
    setEditingId(brand.id)
    setBrandForm({ name: brand.name || brand.brandName || '' })
    setIsModalOpen(true)
  }

  // Xử lý Gửi Form lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const url = editingId ? `${API_URL}/api/admin/brands/${editingId}` : `${API_URL}/api/admin/brands`
      const method = editingId ? 'PUT' : 'POST'

      // Gửi dữ liệu JSON thuần tuý
      const payload = {
        name: brandForm.name
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
        throw new Error(errorData.message || 'Lưu thương hiệu thất bại')
      }

      alert(editingId ? 'Đã cập nhật thương hiệu' : 'Đã thêm thương hiệu mới')
      setIsModalOpen(false)
      fetchBrands()
    } catch (error) {
      alert(error.message)
    }
  }

  // Xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/brands/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Xóa thất bại')
      alert('Đã xóa thương hiệu thành công')
      fetchBrands()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Thương hiệu</h1>
          <p className="mt-2 text-gray-600">Quản lý danh sách các hãng đối tác (Apple, Samsung, Anker, Baseus, Logitech...)</p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm thương hiệu
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Thương hiệu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="2" className="px-6 py-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan="2" className="px-6 py-4 text-center text-gray-500">Chưa có thương hiệu nào.</td></tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id || brand.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name || brand.brandName}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenEdit(brand)}
                          className="text-blue-600 hover:text-blue-700 transition" 
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(brand.id)}
                          className="text-red-600 hover:text-red-700 transition" 
                          title="Xóa"
                        >
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

      {/* MODAL THÊM / SỬA THƯƠNG HIỆU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">{editingId ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tên thương hiệu <span className="text-red-500">*</span></label>
                <input 
                  required 
                  value={brandForm.name} 
                  onChange={e => setBrandForm({...brandForm, name: e.target.value})} 
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                  placeholder="VD: Apple, Samsung, Sony..." 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 border border-slate-300 rounded-full py-3 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white rounded-full py-3 font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  Lưu thương hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBrandsPage