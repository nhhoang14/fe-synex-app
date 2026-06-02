import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'

function AdminInventoryPage() {
  usePageTitle('Quản lý Kho hàng')

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchInventory() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const response = await fetch(`${API_URL}/api/products`)
        const data = await response.json()
        if (active) setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Inventory Fetch Error:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchInventory()
    return () => { active = false }
  }, [])

  const stats = products.reduce((acc, p) => {
    const stock = Number(p.stockQuantity || p.stock || 0)
    if (stock === 0) acc.outOfStock++
    else if (stock < 10) acc.lowStock++
    return acc
  }, { lowStock: 0, outOfStock: 0 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Kho hàng</h1>
        <p className="mt-2 text-gray-600">Theo dõi số lượng tồn kho từng mã hàng, cảnh báo sản phẩm sắp hết hàng</p>
      </div>

      {/* Inventory Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tổng Sản phẩm</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : products.length}</p>
          <p className="mt-1 text-sm text-gray-500">Mã hàng khác nhau</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-yellow-900">Sắp Hết Hàng</p>
          <p className="mt-2 text-3xl font-bold text-yellow-900">{loading ? '...' : stats.lowStock}</p>
          <p className="mt-1 text-sm text-yellow-700">Sản phẩm dưới 10 cái</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-red-900">Hết Hàng</p>
          <p className="mt-2 text-3xl font-bold text-red-900">{loading ? '...' : stats.outOfStock}</p>
          <p className="mt-1 text-sm text-red-700">Sản phẩm cần nhập hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option>Tất cả trạng thái</option>
          <option>Còn hàng</option>
          <option>Sắp hết</option>
          <option>Hết hàng</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã Sản phẩm (ID)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Sản phẩm</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tồn Kho</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Đang tải kho hàng...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Kho hàng trống.</td></tr>
              ) : (
                products.map((item) => {
                  const stock = Number(item.stockQuantity || item.stock || 0)
                  const status = stock === 0 ? 'Hết hàng' : stock < 10 ? 'Sắp hết' : 'Còn hàng'

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">PRD-{item.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.name || item.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-bold">{stock}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={[
                            'inline-block rounded-full px-3 py-1 text-xs font-medium',
                            status === 'Còn hàng'
                              ? 'bg-green-100 text-green-800'
                              : status === 'Sắp hết'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800',
                          ].join(' ')}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-700 transition" title="Chỉnh sửa tồn kho">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminInventoryPage