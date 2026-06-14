import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FaqSection from '../components/FaqSection'
import ProductCard from '../components/ProductCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCategories, getProducts } from '../services/catalogService'
import bannerImage from '../assets/images/banner.jpg'
import category1 from '../assets/images/phonecase.jpg'

function normalizeCategory(value = '') {
  return String(value).trim().toLowerCase()
}

function HomePage() {
  usePageTitle('Synex - Trang chủ')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryStart, setCategoryStart] = useState(0)

  // State quản lý Toast Notification
  const [feedback, setFeedback] = useState('')
  const [progress, setProgress] = useState(100)

  function toObjectArray(data) {
    return Array.isArray(data) ? data.filter((item) => item && typeof item === 'object') : []
  }

  function getProductSold(product) {
    if (typeof product?.soldQuantity === 'number') return product.soldQuantity
    if (typeof product?.sold === 'number') return product.sold

    return toObjectArray(product?.variants).reduce(
      (total, variant) => total + Number(variant?.soldQuantity || variant?.sold || 0),
      0,
    )
  }

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)

      const [productResult, categoryResult] = await Promise.allSettled([
        getProducts(),
        getCategories(),
      ])

      if (!active) return

      if (productResult.status === 'fulfilled') {
        setProducts(toObjectArray(productResult.value).filter((product) => product?.active !== false))
      } else {
        console.error('Lỗi tải sản phẩm:', productResult.reason)
        setProducts([])
      }

      if (categoryResult.status === 'fulfilled') {
        setCategories(toObjectArray(categoryResult.value))
      } else {
        console.error('Lỗi tải danh mục:', categoryResult.reason)
        setCategories([])
      }

      setLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  // Tự động ẩn thông báo sau 3 giây và chạy thanh progress
  useEffect(() => {
    if (feedback) {
      setProgress(100)
      const animTimer = setTimeout(() => setProgress(0), 50)
      const closeTimer = setTimeout(() => setFeedback(''), 3000)
      return () => {
        clearTimeout(animTimer)
        clearTimeout(closeTimer)
      }
    }
  }, [feedback])

  // Hàm xử lý đường dẫn ảnh danh mục từ Backend
  const getCategoryImage = (category) => {
    const imagePath = category.imageUrl || category.image || category.imagePath || category.thumbnail;
    if (imagePath && typeof imagePath === 'string' && imagePath !== 'null') {
      if (imagePath.startsWith('http')) return imagePath;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`;
      return `${API_URL}/${cleanPath}`;
    }
    return category1; // Ảnh mặc định nếu không có dữ liệu
  };

  const categoryList = categories.slice(0, 10)
  const visibleCategories = 4
  const maxCategoryStart = Math.max(0, categoryList.length - visibleCategories)
  const shouldShowCategoryControls = categoryList.length > visibleCategories

  const featuredProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => getProductSold(b) - getProductSold(a))
      .slice(0, 10)
  }, [products])

  const handlePrevCategory = () => {
    setCategoryStart((prev) => Math.max(prev - 1, 0))
  }

  const handleNextCategory = () => {
    setCategoryStart((prev) => Math.min(prev + 1, maxCategoryStart))
  }

  const isSuccess = feedback.toLowerCase().includes('đã') || feedback.toLowerCase().includes('thành công')

  return (
    <div className="pb-10 relative">

      {/* TOAST THÔNG BÁO NỔI DẠNG OVERLAY CHUNG CHO TRANG CHỦ */}
      {feedback && (
        <div className="fixed top-8 left-1/2 z-[9999] flex min-w-[320px] -translate-x-1/2 items-center justify-between overflow-hidden rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
              {isSuccess ? (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <span className="text-xs font-bold">!</span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="ml-6 text-slate-400 hover:text-slate-600 transition">
            ✕
          </button>
          <div 
            className={`absolute bottom-0 left-0 h-1 transition-all duration-[3000ms] ease-linear ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}

      <section
        className="relative -mt-[20px] left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[500px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bannerImage})`,
        }}
      >
        <div className="mx-auto flex min-h-[420px] max-w-[1200px] items-center px-6">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
              Discover what&apos;s new
            </h1>
            <p className="mt-3 text-lg text-slate-700 sm:text-xl">
              Giải pháp đơn giản cho mọi công việc của bạn.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              View all
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-[#2d2d2d] sm:text-4xl">
              Danh mục sản phẩm
            </h2>

            {shouldShowCategoryControls && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevCategory}
                  disabled={categoryStart === 0}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={handleNextCategory}
                  disabled={categoryStart >= maxCategoryStart}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            {loading && categoryList.length === 0 ? (
              <p className="py-10 text-center text-slate-500">Đang tải danh mục...</p>
            ) : categoryList.length === 0 ? (
              <p className="py-10 text-center text-slate-500">Chưa có danh mục sản phẩm.</p>
            ) : (
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${categoryStart * 25}%)`,
                }}
              >
                {categoryList.map((category) => {
                const categoryName = category.name || category.categoryName || 'Danh mục'
                const normalizedName = normalizeCategory(categoryName)
                const imageUrl = getCategoryImage(category)

                return (
                  <div
                    key={category.id || normalizedName}
                    className="w-1/4 shrink-0 px-3"
                  >
                    <Link
                      to={`/products?category=${encodeURIComponent(normalizedName)}`}
                      className="group block"
                    >
                      <div className="overflow-hidden rounded-[28px] bg-[#f3f3f3] transition duration-300 hover:-translate-y-1">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={categoryName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex items-center justify-between px-6 py-5">
                          <h3 className="text-xl font-semibold text-[#2d2d2d]">
                            {categoryName}
                          </h3>

                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d2d2d] text-lg text-white transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
                })}
              </div>
            )}
          </div>

          {shouldShowCategoryControls && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: maxCategoryStart + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCategoryStart(index)}
                  className={`h-2.5 rounded-full transition ${
                    categoryStart === index ? 'w-8 bg-slate-800' : 'w-2.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-2">
        <h2 className="mb-4 text-2xl font-bold text-ink">Sản phẩm nổi bật</h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading ? (
            <p className="col-span-full py-10 text-center text-slate-500">Đang tải sản phẩm...</p>
          ) : featuredProducts.length === 0 ? (
            <p className="col-span-full py-10 text-center text-slate-500">Chưa có sản phẩm nổi bật.</p>
          ) : featuredProducts.map((product) => (
            <ProductCard
              key={product.id || product.productId}
              product={product}
              compact
              onNotify={(msg) => setFeedback(msg)} // Truyền hàm lên thẻ
            />
          ))}
        </div>
      </section>

      <section
        className="mx-auto mt-6 max-w-[1200px] overflow-hidden rounded-[28px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(7,10,16,0.92) 0%, rgba(7,10,16,0.82) 38%, rgba(7,10,16,0.55) 100%), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="flex min-h-[420px] items-center px-7 py-10 sm:px-10 sm:py-14 lg:min-h-[520px] lg:px-14 lg:py-16">
          <div className="max-w-[760px]">
            <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Cộng đồng người dùng
            </h2>

            <p className="mt-6 max-w-[900px] text-lg leading-9 text-white/90 sm:text-xl">
              Chia sẻ góc setup, kinh nghiệm sử dụng và cập nhật ưu đãi mới nhất từ Synex.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="#"
                className="inline-flex min-w-[160px] items-center justify-center rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Fanpage
              </a>

              <a
                href="#"
                className="inline-flex min-w-[140px] items-center justify-center rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Group
              </a>

              <a
                href="#"
                className="inline-flex min-w-[140px] items-center justify-center rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Tiktok
              </a>

              <a
                href="#"
                className="inline-flex min-w-[150px] items-center justify-center rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Zalo OA
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-[1200px]">
        <FaqSection />
      </div>
    </div>
  )
}

export default HomePage