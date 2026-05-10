import { usePageTitle } from '../hooks/usePageTitle'
import { useState } from 'react'

function AdminSettingsPage() {
  usePageTitle('Cấu hình hệ thống')
  const [activeTab, setActiveTab] = useState('store')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cấu hình hệ thống</h1>
        <p className="mt-2 text-gray-600">Thông tin cửa hàng, phí vận chuyển, phương thức thanh toán và phân quyền</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'store'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Thông Tin Cửa Hàng
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'shipping'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Vận Chuyển & Thanh Toán
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Phân Quyền Nhân Viên
        </button>
      </div>

      {/* Store Information Tab */}
      {activeTab === 'store' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Tên Cửa Hàng</label>
            <input
              type="text"
              defaultValue="Synex - Phụ kiện công nghệ"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Địa chỉ</label>
            <input
              type="text"
              defaultValue="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900">Hotline</label>
              <input
                type="tel"
                defaultValue="1900 12345"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Email Hỗ Trợ</label>
              <input
                type="email"
                defaultValue="support@synex.com"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Lưu thay đổi
          </button>
        </div>
      )}

      {/* Shipping & Payment Tab */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          {/* Shipping Methods */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Phương Thức Vận Chuyển</h3>
            {[
              { name: 'Giao hàng tiêu chuẩn', fee: '30,000đ', time: '3-5 ngày' },
              { name: 'Giao hàng nhanh', fee: '50,000đ', time: '1-2 ngày' },
              { name: 'Giao hàng ngoài giờ', fee: '70,000đ', time: '2 tiếng' },
            ].map((method) => (
              <div key={method.name} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    defaultValue={method.fee}
                    className="w-24 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button className="text-blue-600 hover:text-blue-700 transition">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Phương Thức Thanh Toán</h3>
            {[
              { name: 'Thanh toán khi nhận hàng (COD)', enabled: true },
              { name: 'Chuyển khoản ngân hàng', enabled: true },
              { name: 'Thẻ tín dụng/Ghi nợ', enabled: false },
              { name: 'Ví điện tử', enabled: false },
            ].map((method) => (
              <div key={method.name} className="flex items-center justify-between">
                <p className="text-sm text-gray-900">{method.name}</p>
                <button
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    method.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      method.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Phân Quyền Nhân Viên</h3>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm nhân viên
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Nhân Viên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vai Trò</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'Nguyễn Anh Tuấn', email: 'tuan@synex.com', role: 'Admin Chính', status: 'Hoạt động' },
                  { name: 'Trần Minh Nhật', email: 'nhat@synex.com', role: 'Nhân viên bán hàng', status: 'Hoạt động' },
                  { name: 'Phạm Thị Hương', email: 'huong@synex.com', role: 'Nhân viên kho', status: 'Hoạt động' },
                  { name: 'Võ Quốc Khánh', email: 'khanh@synex.com', role: 'Nhân viên bán hàng', status: 'Hoạt động' },
                ].map((staff) => (
                  <tr key={staff.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{staff.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{staff.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <select className="rounded-lg border border-gray-300 px-3 py-1 text-sm">
                        <option>Admin Chính</option>
                        <option>Nhân viên bán hàng</option>
                        <option>Nhân viên kho</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-red-600 hover:text-red-700 transition" title="Xóa nhân viên">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettingsPage
