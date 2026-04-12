import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FaqSection from '../components/FaqSection'
import ProductCard from '../components/ProductCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCategories, getProducts } from '../services/catalogService'

const ACCESSORY_SLIDES = [
  {
    title: 'iPhone Cases',
    image:
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200&q=80',
  },
  {
    title: 'AirPods & Audio',
    image:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&q=80',
  },
  {
    title: 'Apple Watch Straps',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80',
  },
  {
    title: 'MagSafe Chargers',
    image:
      'https://images.unsplash.com/photo-1615526675051-f6a48d4d969d?w=1200&q=80',
  },
]

function getCategoryIcon(name = '') {
  const lower = name.toLowerCase()

  if (lower.includes('phone') || lower.includes('iphone')) return '📱'
  if (lower.includes('watch')) return '⌚'
  if (lower.includes('audio') || lower.includes('airpod') || lower.includes('head')) return '🎧'
  if (lower.includes('charger') || lower.includes('sac')) return '🔌'
  if (lower.includes('case') || lower.includes('op') || lower.includes('bao')) return '🛡️'
  if (lower.includes('cable') || lower.includes('cap')) return '🧵'
  if (lower.includes('keyboard')) return '⌨️'
  if (lower.includes('mouse') || lower.includes('chuot')) return '🖱️'
  return '✨'
}

function normalizeCategory(value = '') {
  return String(value).trim().toLowerCase()
}

function HomePage() {
  usePageTitle('Synex - Trang chủ')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let mounted = true

    Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        if (mounted) {
          setProducts(Array.isArray(productData) ? productData.slice(0, 10) : [])
          setCategories(Array.isArray(categoryData) ? categoryData : [])
        }
      })
      .catch(() => {
        if (mounted) {
          setProducts([])
          setCategories([])
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <section
        className="flex min-h-[420px] items-center overflow-hidden rounded-[22px] bg-cover bg-right bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(243, 246, 252, 0.86) 0%, rgba(243, 246, 252, 0.55) 42%, rgba(243, 246, 252, 0.08) 100%), url('https://images.unsplash.com/photo-1603898037225-1f3f4f4bf4e9?w=2200&q=100')",
        }}
      >
        <div className="max-w-xl px-8 py-8 backdrop-blur-[1px] sm:px-10">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">Discover what&apos;s new</h1>
          <p className="mt-3 text-lg text-slate-700 sm:text-xl">Giải pháp đơn giản cho mọi công việc của bạn.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            View all
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Phụ kiện Apple nổi bật</h2>
          <Link to="/products" className="font-semibold text-sky-700">
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {ACCESSORY_SLIDES.map((slide) => (
            <article key={slide.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={slide.image} alt={slide.title} className="aspect-[4/3] w-full object-cover" />
              <p className="m-0 p-3 font-semibold text-ink">{slide.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ink">Category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id || category.name}
              to={`/products?category=${encodeURIComponent(
                normalizeCategory(category.name || category.categoryName || ''),
              )}`}
              className="grid min-h-24 justify-items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-ink transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-xl">
                {getCategoryIcon(category.name || category.categoryName || '')}
              </span>
              <span>{category.name || category.categoryName || 'Category'}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ink">Sản phẩm nổi bật</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id || product.productId} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-ink">Cộng đồng người dùng</h2>
        <p className="max-w-3xl text-slate-700">
          Chia sẻ góc setup, kinh nghiệm sử dụng và cập nhật ưu đãi mới nhất từ Synex.
        </p>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ink">Những hãng đã hợp tác</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <span className="rounded-2xl border border-dashed border-borderStrong px-4 py-3 text-center">Atlas</span>
          <span className="rounded-2xl border border-dashed border-borderStrong px-4 py-3 text-center">Core Desk</span>
          <span className="rounded-2xl border border-dashed border-borderStrong px-4 py-3 text-center">Alpha Pro</span>
          <span className="rounded-2xl border border-dashed border-borderStrong px-4 py-3 text-center">MagSnap</span>
          <span className="rounded-2xl border border-dashed border-borderStrong px-4 py-3 text-center">Ivy Pro</span>
        </div>
      </section>

      <FaqSection />
    </div>
  )
}

export default HomePage
