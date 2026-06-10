import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../contexts/AuthContext'

function AdminCategoriesPage() {
  usePageTitle('Quản lý Danh mục')
  
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State quản lý form Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '' })
  
  // Thêm State để lưu File ảnh vật lý và Link preview ảo
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

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
    setCategoryForm({ name: '' })
    setImageFile(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category) => {
    setEditingId(category.id)
    setCategoryForm({ 
      name: category.name || category.categoryName || ''
    })
    
    // Bắt bao quát mọi tên trường dữ liệu Backend có thể trả về & Xử lý đường dẫn
    const imgPath = category.imageUrl || category.image || category.imagePath || category.thumbnail || null;
    let previewUrl = imgPath;
    if (imgPath && typeof imgPath === 'string' && !imgPath.startsWith('http') && !imgPath.startsWith('blob:')) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      let cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
      if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`;
      previewUrl = `${API_URL}/${cleanPath}`;
    }
    
    setImagePreview(previewUrl)
    setImageFile(null) // Reset file up mới
    setIsModalOpen(true)
  }

  // Hàm xử lý khi chọn ảnh từ máy tính
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file)) // Tạo link ảo để hiện preview ngay lập tức
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const url = editingId ? `${API_URL}/api/admin/categories/${editingId}` : `${API_URL}/api/admin/categories`
      const method = editingId ? 'PUT' : 'POST'

      const formData = new FormData()
      formData.append('name', categoryForm.name)
      
      if (imageFile) {
        formData.append('imageFile', imageFile)
        
        // FIX LỖI SPRING BOOT RỚT ẢNH TRÊN PUT: Up ảnh lấy link nhét thêm vào form
        if (editingId) {
          try {
            const uploadData = new FormData()
            uploadData.append('file', imageFile)
            const uploadRes = await fetch(`${API_URL}/api/uploads/images`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: uploadData
            })
            if (uploadRes.ok) {
              const text = await uploadRes.text()
              try {
                const json = JSON.parse(text)
                const finalUrl = json.url || json.imageUrl || json.image || text;
                formData.append('imageUrl', finalUrl)
                formData.append('image', finalUrl)
              } catch (err) {
                formData.append('imageUrl', text)
                formData.append('image', text)
              }
            }
          } catch (err) {
            console.log("Fallback upload failed", err)
          }
        }
      }
      
      if (editingId) {
        formData.append('id', editingId)
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
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
          categories.map((category) => {
            // FIX HIỂN THỊ ẢNH VÀ XỬ LÝ TIỀN TỐ /uploads/
            const imagePath = category.imageUrl || category.image || category.imagePath || category.thumbnail;
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            
            let fullImageUrl = null;
            if (imagePath && typeof imagePath === 'string' && imagePath !== 'null') {
              if (imagePath.startsWith('http')) {
                fullImageUrl = imagePath;
              } else {
                let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
                if (!cleanPath.startsWith('uploads/')) {
                  cleanPath = `uploads/${cleanPath}`;
                }
                fullImageUrl = `${API_URL}/${cleanPath}`;
              }
            }

            return (
              <div
                key={category.id || category.name}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-slate-100 relative group overflow-hidden">
                  {fullImageUrl && (
                    <img 
                      src={fullImageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                      onError={(e) => {
                        // Nếu ảnh bị lỗi 404 từ server, ẩn ảnh và hiện icon dự phòng
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  )}
                  <div 
                    className="absolute inset-0 items-center justify-center text-slate-400 bg-slate-100"
                    style={{ display: fullImageUrl ? 'none' : 'flex' }}
                  >
                    <span className="material-symbols-outlined text-4xl">image</span>
                  </div>
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
            )
          })
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
                <label className="text-sm font-bold text-slate-700">Hình ảnh danh mục</label>
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition relative overflow-hidden h-48">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-white" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="material-symbols-outlined text-4xl text-slate-400">cloud_upload</span>
                      <p className="mt-2 text-sm text-slate-500 font-medium">Bấm để tải ảnh lên</p>
                      <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG</p>
                    </div>
                  )}
                </label>
              </div>

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