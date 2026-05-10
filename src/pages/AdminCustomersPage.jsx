import { usePageTitle } from '../hooks/usePageTitle'

function AdminCustomersPage() {
  usePageTitle('Quản lý Khách hàng')

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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tổng Đơn Hàng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tổng Chi Tiêu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  name: 'Nguyễn Văn A',
                  email: 'nguyenvana@example.com',
                  phone: '0123456789',
                  orders: 5,
                  spent: '$1,250',
                  status: 'Hoạt động',
                },
                {
                  name: 'Trần Thị B',
                  email: 'tranthib@example.com',
                  phone: '0987654321',
                  orders: 12,
                  spent: '$3,840',
                  status: 'Hoạt động',
                },
              ].map((customer) => (
                <tr key={customer.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.spent}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 transition" title="Xem chi tiết">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className="text-red-600 hover:text-red-700 transition" title="Khóa tài khoản">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
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

export default AdminCustomersPage
