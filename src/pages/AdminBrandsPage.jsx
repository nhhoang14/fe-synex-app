import { usePageTitle } from '../hooks/usePageTitle'

function AdminBrandsPage() {
  usePageTitle('Quản lý Thương hiệu')

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

      {/* Brands Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Thương hiệu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số Sản phẩm</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quốc gia</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Apple', products: 34, country: 'Mỹ', status: 'Hoạt động' },
                { name: 'Samsung', products: 28, country: 'Hàn Quốc', status: 'Hoạt động' },
                { name: 'Anker', products: 45, country: 'Mỹ', status: 'Hoạt động' },
                { name: 'Baseus', products: 32, country: 'Trung Quốc', status: 'Hoạt động' },
                { name: 'Logitech', products: 19, country: 'Thụy Sĩ', status: 'Hoạt động' },
              ].map((brand) => (
                <tr key={brand.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{brand.products}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{brand.country}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {brand.status}
                    </span>
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminBrandsPage
