import { usePageTitle } from '../hooks/usePageTitle'

function AdminAnalyticsPage() {
  usePageTitle('Thống kê & Báo cáo')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Thống kê & Báo cáo</h1>
        <p className="mt-2 text-gray-600">Báo cáo doanh thu, sản phẩm bán chạy nhất, phân tích chi tiết kinh doanh</p>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-3 flex-wrap">
        <input type="date" className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
        <span className="flex items-center text-gray-600">đến</span>
        <input type="date" className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
          Lọc
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">$125,430</p>
          <p className="mt-1 text-sm text-green-600">+12.5% so với tháng trước</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">542</p>
          <p className="mt-1 text-sm text-green-600">+8.3% so với tháng trước</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Giá Trị Đơn TB</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">$231</p>
          <p className="mt-1 text-sm text-green-600">+3.2% so với tháng trước</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tỷ Lệ Hoàn Trả</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">2.1%</p>
          <p className="mt-1 text-sm text-red-600">-0.3% so với tháng trước</p>
        </div>
      </div>

      {/* Reports Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Best Sellers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Sản Phẩm Bán Chạy Nhất</h2>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Apple AirPods Pro', sold: 234, revenue: '$18,720' },
              { name: 'Anker PowerBank 20000', sold: 156, revenue: '$9,360' },
              { name: 'Samsung Galaxy Buds', sold: 128, revenue: '$6,400' },
              { name: 'Baseus USB-C Cable', sold: 89, revenue: '$2,670' },
            ].map((product) => (
              <div key={product.name} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Bán được: {product.sold} cái</p>
                </div>
                <p className="font-semibold text-gray-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* By Brand */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Doanh Thu Theo Thương Hiệu</h2>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Apple', revenue: '$38,500', percent: 30.7 },
              { name: 'Anker', revenue: '$25,800', percent: 20.6 },
              { name: 'Samsung', revenue: '$18,900', percent: 15.1 },
              { name: 'Baseus', revenue: '$16,400', percent: 13.1 },
              { name: 'Logitech', revenue: '$12,150', percent: 9.7 },
              { name: 'Khác', revenue: '$13,680', percent: 10.8 },
            ].map((brand) => (
              <div key={brand.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                  <p className="text-sm text-gray-600">{brand.revenue}</p>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${brand.percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{brand.percent}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Xu Hướng Doanh Thu Hàng Tháng</h2>
        <div className="mt-4 h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
          Biểu đồ xu hướng doanh thu sẽ được hiển thị tại đây
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
