import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

function NotFoundPage() {
  usePageTitle('404 - Synex')

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 rounded-[28px] border border-border bg-white p-8 text-center shadow-sm">
      <h1 className="text-6xl font-bold tracking-tight text-ink">404</h1>
      <p className="text-slate-600">Không tim thay trang ban can.</p>
      <Link to="/" className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
        Ve trang chu
      </Link>
    </section>
  )
}

export default NotFoundPage
