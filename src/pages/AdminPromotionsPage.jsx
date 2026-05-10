import { usePageTitle } from '../hooks/usePageTitle'

function AdminPromotionsPage() {
  usePageTitle('Quản lý Khuyến mãi')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Khuyến mãi</h1>
          <p className="mt-2 text-gray-600">Quản lý mã giảm giá, chương trình sale, flash sale và banner quảng cáo</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo khuyến mãi
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Mã Giảm Giá
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Flash Sale
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Banner Quảng Cáo
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm mã giảm giá..."
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Sắp tới</option>
          <option>Hết hạn</option>
        </select>
      </div>

      {/* Promotions Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã Khuyến Mãi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loại</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giá Trị</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ngày Bắt Đầu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ngày Kết Thúc</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Lượt Sử Dụng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  code: 'SUMMER2024',
                  type: 'Giảm giá %',
                  value: '20%',
                  start: '01/06/2024',
                  end: '30/08/2024',
                  used: '156/500',
                  status: 'Hoạt động',
                },
                {
                  code: 'WELCOME50K',
                  type: 'Giảm giá cố định',
                  value: '50.000đ',
                  start: '01/05/2024',
                  end: '31/05/2024',
                  used: '234/1000',
                  status: 'Hoạt động',
                },
                {
                  code: 'FLASH2024',
                  type: 'Flash Sale',
                  value: '30%',
                  start: '10/05/2024',
                  end: '10/05/2024',
                  used: '89/200',
                  status: 'Sắp tới',
                },
              ].map((promo) => (
                <tr key={promo.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{promo.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{promo.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{promo.value}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{promo.start}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{promo.end}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{promo.used}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={[
                        'inline-block rounded-full px-3 py-1 text-xs font-medium',
                        promo.status === 'Hoạt động'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800',
                      ].join(' ')}
                    >
                      {promo.status}
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

export default AdminPromotionsPage
