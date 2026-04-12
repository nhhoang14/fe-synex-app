import { Link, NavLink, Outlet } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../constants'

const ADMIN_NAV_ITEMS = [
  { to: ROUTES.ADMIN, label: 'Bang dieu khien', end: true },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Quan ly san pham' },
  { to: ROUTES.ADMIN_ORDERS, label: 'Quan ly don hang' },
]

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-white/10 bg-slate-950 px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5">
        <div className="flex items-center justify-between gap-3 lg:block">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">ADMIN AREA</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          </div>

          <Link
            to={ROUTES.HOME}
            className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:mt-6"
          >
            Chuyen sang trang nguoi dung
          </Link>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'bg-sky-400/20 text-sky-200'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
