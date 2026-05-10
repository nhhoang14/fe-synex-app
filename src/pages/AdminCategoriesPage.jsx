import { usePageTitle } from '../hooks/usePageTitle'

function AdminCategoriesPage() {
  usePageTitle('Quản lý Danh mục')

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

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Tai nghe', count: 45 },
          { name: 'Sạc dự phòng', count: 32 },
          { name: 'Cáp sạc', count: 28 },
          { name: 'Chuột/Bàn phím', count: 38 },
          { name: 'Ốp lưng/Bao', count: 56 },
          { name: 'Giá đỡ', count: 19 },
        ].map((category) => (
          <div
            key={category.name}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{category.count} sản phẩm</p>
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
        ))}
      </div>
    </div>
  )
}

export default AdminCategoriesPage
