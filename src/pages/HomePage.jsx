import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FaqSection from '../components/FaqSection'
import ProductCard from '../components/ProductCard'
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
    <div className="page-stack">
      <section className="home-apple-banner">
        <div className="home-apple-banner-content">
          <h1>Discover what&apos;s new</h1>
          <p>Giải pháp đơn giản cho mọi công việc của bạn.</p>
          <Link to="/products" className="home-apple-cta">
            View all
          </Link>
        </div>
      </section>

      <section className="section-block home-accessory-slider">
        <div className="home-slider-head">
          <h2>Phụ kiện Apple nổi bật</h2>
          <Link to="/products">Xem tất cả</Link>
        </div>
        <div className="home-slider-track">
          {ACCESSORY_SLIDES.map((slide) => (
            <article key={slide.title} className="home-slide-card">
              <img src={slide.image} alt={slide.title} />
              <p>{slide.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Category</h2>
        <div className="home-category-grid">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id || category.name}
              to={`/products?category=${encodeURIComponent(
                normalizeCategory(category.name || category.categoryName || ''),
              )}`}
              className="home-category-card"
            >
              <span className="home-category-icon">
                {getCategoryIcon(category.name || category.categoryName || '')}
              </span>
              <span>{category.name || category.categoryName || 'Category'}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Sản phẩm nổi bật</h2>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id || product.productId} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Cộng đồng người dùng</h2>
        <p>
          Chia sẻ góc setup, kinh nghiệm sử dụng và cập nhật ưu đãi mới nhất từ Synex.
        </p>
      </section>

      <section className="section-block">
        <h2>Những hãng đã hợp tác</h2>
        <div className="partner-row">
          <span>Atlas</span>
          <span>Core Desk</span>
          <span>Alpha Pro</span>
          <span>MagSnap</span>
          <span>Ivy Pro</span>
        </div>
      </section>

      <FaqSection />
    </div>
  )
}

export default HomePage
