import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../constants'

const ADMIN_NAV_SECTIONS = [
  {
    section: 'Tổng quan',
    icon: 'dashboard',
    items: [
      { to: ROUTES.ADMIN_DASHBOARD, label: 'Tổng quan', icon: 'dashboard', end: true },
    ],
  },
  {
    section: 'Quản lý Kinh doanh',
    icon: 'store',
    items: [
      { to: ROUTES.ADMIN_ORDERS, label: 'Quản lý Đơn hàng', icon: 'receipt_long' },
      { to: ROUTES.ADMIN_CUSTOMERS, label: 'Quản lý Khách hàng', icon: 'people' },
    ],
  },
  {
    section: 'Quản lý Sản phẩm & Kho',
    icon: 'package_2',
    items: [
      { to: ROUTES.ADMIN_PRODUCTS, label: 'Sản phẩm', icon: 'inventory_2' },
      { to: ROUTES.ADMIN_CATEGORIES, label: 'Danh mục', icon: 'category' },
      { to: ROUTES.ADMIN_BRANDS, label: 'Thương hiệu', icon: 'business' },
      { to: ROUTES.ADMIN_INVENTORY, label: 'Kho hàng', icon: 'warehouse' },
    ],
  },
  {
    section: 'Tương tác & Khuyến mãi',
    icon: 'campaign',
    items: [
      { to: ROUTES.ADMIN_REVIEWS, label: 'Đánh giá & Bình luận', icon: 'reviews' },
      { to: ROUTES.ADMIN_PROMOTIONS, label: 'Khuyến mãi', icon: 'local_offer' },
    ],
  },
  {
    section: 'Hệ thống & Báo cáo',
    icon: 'admin_panel_settings',
    items: [
      { to: ROUTES.ADMIN_ANALYTICS, label: 'Thống kê & Báo cáo', icon: 'analytics' },
      { to: ROUTES.ADMIN_SETTINGS, label: 'Cấu hình hệ thống', icon: 'settings' },
    ],
  },
]

function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    'Tổng quan': true,
    'Quản lý Kinh doanh': false,
    'Quản lý Sản phẩm & Kho': false,
    'Tương tác & Khuyến mãi': false,
    'Hệ thống & Báo cáo': false,
  })

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }))
  }

  return (
    <div
      className={[
        'min-h-screen bg-slate-950 lg:grid',
        isCollapsed ? 'lg:grid-cols-[92px_1fr]' : 'lg:grid-cols-[280px_1fr]',
      ].join(' ')}
    >
      <aside
        className={[
          'border-b border-white/10 bg-slate-950 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:flex lg:flex-col',
          isCollapsed ? 'px-3 lg:px-3' : 'px-4 lg:px-5',
        ].join(' ')}
        style={{
          scrollbarColor: 'rgba(100, 116, 139, 0.5) transparent',
          scrollbarWidth: 'thin',
        }}
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
            </div>
          )}
        </div>

        <nav className="mt-6 flex flex-col gap-6 overflow-y-auto pb-4 flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {ADMIN_NAV_SECTIONS.map((section) => {
            const isSingleItem = section.items.length === 1
            const isExpanded = expandedSections[section.section]

            // Single item sections render directly as NavLink
            if (isSingleItem) {
              const item = section.items[0]
              return (
                <NavLink
                  key={section.section}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                      isCollapsed ? 'justify-center lg:w-full' : '',
                      isActive
                        ? 'bg-sky-400/20 text-sky-200'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0">{section.icon}</span>
                  <span className={isCollapsed ? 'hidden' : ''}>{item.label}</span>
                </NavLink>
              )
            }

            // Multi-item sections render with collapsible header
            return (
              <div key={section.section}>
                <button
                  onClick={() => toggleSection(section.section)}
                  className={[
                    'w-full inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isCollapsed ? 'justify-center' : 'justify-between',
                    isExpanded
                      ? 'bg-white/5 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                  title={section.section}
                >
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0">{section.icon}</span>
                  <span className={isCollapsed ? 'hidden' : 'flex-1'}>{section.section}</span>
                  {!isCollapsed && (
                    <span className="material-symbols-outlined text-[18px] transition-transform flex-shrink-0">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  )}
                </button>
                {isExpanded && (
                  <div className="flex flex-col gap-1 mt-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          [
                            'inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                            isCollapsed ? 'justify-center lg:w-full' : 'ml-2',
                            isActive
                              ? 'bg-sky-400/20 text-sky-200'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white',
                          ].join(' ')
                        }
                        aria-label={item.label}
                        title={item.label}
                      >
                        <span className="material-symbols-outlined text-[18px] flex-shrink-0">{item.icon}</span>
                        <span className={isCollapsed ? 'hidden' : ''}>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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