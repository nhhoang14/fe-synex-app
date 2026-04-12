import { Link } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../constants'

const QUICK_LINKS = [
  { to: ROUTES.PRODUCTS, label: 'Sản phẩm' },
  { to: ROUTES.CART, label: 'Giỏ hàng' },
  { to: ROUTES.ORDERS, label: 'Đơn hàng của tôi' },
  { to: ROUTES.CONTACT, label: 'Liên hệ' },
]

function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-border bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">{APP_NAME}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Thiết kế gọn, vận hành rõ, mua sắm nhanh.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Hệ thống storefront được xây để tập trung vào trải nghiệm mua hàng, quy trình
              thanh toán và hỗ trợ khách hàng một cách rõ ràng, nhất quán.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Liên kết nhanh</h3>
            <div className="mt-4 grid gap-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-200 transition hover:border-sky-400/40 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Hỗ trợ</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                Hotline: <span className="font-semibold text-white">1900 6868</span>
              </p>
              <p>
                Email: <span className="font-semibold text-white">support@synex.vn</span>
              </p>
              <p>Thời gian làm việc: 08:30 - 18:00, Thứ Hai đến Thứ Bảy</p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">
            Trải nghiệm mua sắm tập trung, thiết kế tối giản, điều hướng rõ ràng.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
