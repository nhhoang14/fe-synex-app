import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../constants'

// Cấu trúc Navbar dạng phẳng (Flat list) với các mục bạn yêu cầu
const ADMIN_NAV_ITEMS = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: ROUTES.ADMIN_CUSTOMERS, label: 'Người dùng', icon: 'people' },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Sản phẩm', icon: 'inventory_2' },
  { to: ROUTES.ADMIN_ORDERS, label: 'Đơn hàng', icon: 'receipt_long' },
  { to: ROUTES.ADMIN_CATEGORIES, label: 'Danh mục', icon: 'category' },
  { to: ROUTES.ADMIN_BRANDS, label: 'Thương hiệu', icon: 'business' },
  { to: ROUTES.ADMIN_PROMOTIONS, label: 'Voucher', icon: 'local_offer' },
  // ĐÃ SỬA: Đổi "Thống kê" thành "Phản hồi liên hệ"
  { to: ROUTES.ADMIN_REVIEWS, label: 'Phản hồi liên hệ', icon: 'forum' },
]

function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={[
        'min-h-screen bg-slate-100 lg:grid',
        isCollapsed ? 'lg:grid-cols-[92px_1fr]' : 'lg:grid-cols-[280px_1fr]',
      ].join(' ')}
    >
      {/* SIDEBAR - GIAO DIỆN NỀN XANH ĐEN */}
      <aside
        className={[
          'border-r border-white/10 bg-slate-950 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col transition-all duration-300',
        ].join(' ')}
      >
        <div className={`mb-8 ${isCollapsed ? 'px-3 flex justify-center' : 'px-6'}`}>
          {isCollapsed ? (
            // ĐÃ SỬA: Tăng kích thước icon khi thu gọn (từ 32px lên 40px)
            <span className="material-symbols-outlined text-[40px] text-blue-500 font-bold">
              automation
            </span>
          ) : (
            <div>
              <div className="mt-2 flex items-center gap-2">
                {/* ĐÃ SỬA: Tăng kích thước icon (từ 28px lên 36px) */}
                <span className="material-symbols-outlined text-[36px] text-blue-500" aria-hidden="true">
                  automation
                </span>
                {/* ĐÃ SỬA: Tăng kích thước chữ (từ text-2xl lên text-4xl) */}
                <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
              </div>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto pb-4 flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-4 py-3 transition-all duration-200 font-medium',
                  isCollapsed ? 'justify-center mx-3 rounded-xl' : 'mx-4 px-4 rounded-xl',
                  isActive
                    ? 'bg-sky-400/20 text-sky-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`material-symbols-outlined flex-shrink-0 ${isCollapsed ? 'text-[24px]' : 'text-[22px]'}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="text-[15px] tracking-wide">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT - KHU VỰC NỘI DUNG (NỀN SÁNG) */}
      <main className="flex flex-col min-h-screen">
        {/* Header Admin */}
        <div className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8 sticky top-0 z-10 shadow-sm">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>

          <Link
            to={ROUTES.HOME}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span className="hidden sm:inline">Xem cửa hàng</span>
          </Link>
        </div>

        {/* Nội dung các trang con (Outlet) */}
        <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout