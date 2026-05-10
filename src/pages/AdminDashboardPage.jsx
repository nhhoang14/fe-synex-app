import { usePageTitle } from '../hooks/usePageTitle'

function AdminDashboardPage() {
  usePageTitle('Bảng điều khiển')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bảng điều khiển</h1>
        <p className="mt-2 text-gray-600">Xem nhanh các chỉ số quan trọng và tình hình kinh doanh</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng Doanh Thu', value: '$45,231', change: '+14.2%', icon: 'trending_up' },
          { label: 'Đơn Hàng Mới', value: '128', change: '+8.1%', icon: 'shopping_cart' },
          { label: 'Khách Hàng Mới', value: '42', change: '+5.3%', icon: 'person_add' },
          { label: 'Tỷ Lệ Chuyển Đổi', value: '3.24%', change: '+2.1%', icon: 'trending_up' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="mt-1 text-sm text-green-600">{metric.change}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <span className="material-symbols-outlined text-blue-600">{metric.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Biểu Đồ Doanh Thu</h2>
          <div className="mt-4 h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Biểu đồ doanh thu sẽ được hiển thị tại đây
          </div>
        </div>

        {/* Growth Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Biểu Đồ Tăng Trưởng</h2>
          <div className="mt-4 h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Biểu đồ tăng trưởng sẽ được hiển thị tại đây
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Đơn Hàng Gần Đây</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Mã Đơn</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Khách Hàng</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Giá Trị</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">#ORD-001</td>
                <td className="px-4 py-2 text-sm text-gray-600">Nguyễn Văn A</td>
                <td className="px-4 py-2 text-sm text-gray-900">$1,250</td>
                <td className="px-4 py-2 text-sm">
                  <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    Chờ xác nhận
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
