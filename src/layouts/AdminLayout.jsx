import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../constants'

const ADMIN_NAV_ITEMS = [
  { to: ROUTES.ADMIN, label: 'Bảng điều khiển', icon: 'dashboard', end: true },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Quản lý sản phẩm', icon: 'inventory_2' },
  { to: ROUTES.ADMIN_ORDERS, label: 'Quản lý đơn hàng', icon: 'receipt_long' },
]

function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={[
        'min-h-screen bg-slate-950 lg:grid',
        isCollapsed ? 'lg:grid-cols-[92px_1fr]' : 'lg:grid-cols-[280px_1fr]',
      ].join(' ')}
    >
      <aside
        className={[
          'border-b border-white/10 bg-slate-950 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r',
          isCollapsed ? 'px-3 lg:px-3' : 'px-4 lg:px-5',
        ].join(' ')}
      >
        <div>
          {isCollapsed ? (
            <div className="hidden lg:flex lg:justify-center">
              <span
                className="material-symbols-outlined text-[34px] text-blue-500"
                aria-hidden="true"
              >
                automation
              </span>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                ADMIN AREA
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[28px] text-blue-500"
                  aria-hidden="true"
                >
                  automation
                </span>
                <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
              </div>

              <Link
                to={ROUTES.HOME}
                className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Chuyển sang trang người dùng
              </Link>
            </div>
          )}
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  isCollapsed ? 'justify-center lg:w-full' : '',
                  isActive
                    ? 'bg-sky-400/20 text-sky-200'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
              aria-label={item.label}
              title={item.label}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className={isCollapsed ? 'hidden' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="bg-slate-100">
        <div className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-2 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            aria-label={isCollapsed ? 'Mở rộng thanh điều hướng admin' : 'Thu gọn thanh điều hướng admin'}
            title={isCollapsed ? 'Mở rộng menu admin' : 'Thu gọn menu admin'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'left_panel_open' : 'left_panel_close'}
            </span>
          </button>

          <Link
            to={ROUTES.HOME}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            aria-label="Quay trở lại trang người dùng"
            title="Quay trở lại trang người dùng"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className="hidden sm:inline">Trang người dùng</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout