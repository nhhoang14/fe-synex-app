import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { usePageTitle } from '../hooks/usePageTitle'

function WishlistPage() {
  usePageTitle('Sản phẩm đã thích - Synex')

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">USER / LIKED PRODUCTS</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Sản phẩm đã thích</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Danh sách sản phẩm bạn đã thích. Bạn có thể lưu các sản phẩm ở đây để xem lại sau.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng sản phẩm đã thích</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">0</strong>
        </article>
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm md:col-span-2">
          <p className="text-sm font-medium text-slate-600">Điều hướng nhanh</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link to={ROUTES.PRODUCTS} className="rounded-full border border-border bg-white px-4 py-2 font-semibold text-ink transition hover:bg-slate-50">
              Xem sản phẩm
            </Link>
            <Link to={ROUTES.CART} className="rounded-full border border-border bg-white px-4 py-2 font-semibold text-ink transition hover:bg-slate-50">
              Mở giỏ hàng
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Danh sách sản phẩm đã thích</h2>
        <p className="mt-4 text-slate-600">Bạn chưa có sản phẩm nào trong danh sách đã thích.</p>
      </section>
    </div>
  )
}

export default WishlistPage
