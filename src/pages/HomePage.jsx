import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FaqSection from '../components/FaqSection'
import ProductCard from '../components/ProductCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCategories, getProducts } from '../services/catalogService'
import bannerImage from '../assets/images/banner.jpg'
import category1 from '../assets/images/phonecase.jpg'
import category2 from '../assets/images/charging.jpg'
import category3 from '../assets/images/caple.png'
import category4 from '../assets/images/audio.jpg'
import category5 from '../assets/images/watchaccessories.jpg'
import category6 from '../assets/images/desksetup.jpg'

function normalizeCategory(value = '') {
  return String(value).trim().toLowerCase()
}

function getCategoryDisplay(categoryName = '') {
  const name = normalizeCategory(categoryName)

  if (name === 'iphone cases') {
    return {
      title: 'iPhone Cases',
      image: category1,
    }
  }

  if (name === 'charging') {
    return {
      title: 'Charging',
      image: category2,
    }
  }

  if (name === 'cables') {
    return {
      title: 'Cables',
      image: category3,
    }
  }

  if (name === 'audio') {
    return {
      title: 'Audio',
      image: category4,
    }
  }

  if (name === 'watch accessories') {
    return {
      title: 'Watch Accessories',
      image: category5,
    }
  }

  if (name === 'desk setup') {
    return {
      title: 'Desk Setup',
      image: category6,
    }
  }

  return {
    title: categoryName || 'Category',
    image: category1,
  }
}

function HomePage() {
  usePageTitle('Synex - Trang chủ')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryStart, setCategoryStart] = useState(0)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([getProducts(), getCategories()]).then((results) => {
      if (!mounted) return

      const productResult = results[0]
      const categoryResult = results[1]

      if (productResult.status === 'fulfilled' && Array.isArray(productResult.value)) {
        setProducts(productResult.value.slice(0, 6))
      } else {
        setProducts([])
      }

      if (categoryResult.status === 'fulfilled' && Array.isArray(categoryResult.value)) {
        setCategories(categoryResult.value)
      } else {
        setCategories([])
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  const fallbackCategories = [
    { id: 1, name: 'iPhone Cases' },
    { id: 2, name: 'Charging' },
    { id: 3, name: 'Cables' },
    { id: 4, name: 'Audio' },
    { id: 5, name: 'Watch Accessories' },
    { id: 6, name: 'Desk Setup' },
  ]

  const categoryList = (categories.length ? categories : fallbackCategories).slice(0, 6)
  const visibleCategories = 4
  const maxCategoryStart = Math.max(0, categoryList.length - visibleCategories)

  const handlePrevCategory = () => {
    setCategoryStart((prev) => Math.max(prev - 1, 0))
  }

  const handleNextCategory = () => {
    setCategoryStart((prev) => Math.min(prev + 1, maxCategoryStart))
  }

  return (
    <div className="pb-10">
      <section
        className="relative -mt-[20px] left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[420px] bg-cover bg-center bg-no-repeat"
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
          </div>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${categoryStart * 25}%)`,
              }}
            >
              {categoryList.map((category) => {
                const categoryName = category.name || category.categoryName || 'Danh mục'
                const normalizedName = normalizeCategory(categoryName)
                const display = getCategoryDisplay(categoryName)

                return (
                  <div
                    key={category.id || categoryName}
                    className="w-1/4 shrink-0 px-3"
                  >
                    <Link
                      to={`/products?category=${encodeURIComponent(normalizedName)}`}
                      className="group block"
                    >
                      <div className="overflow-hidden rounded-[28px] bg-[#f3f3f3] transition duration-300 hover:-translate-y-1">
                        <div className="aspect-[4/6] overflow-hidden">
                          <img
                            src={display.image}
                            alt={display.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex items-center justify-between px-6 py-5">
                          <h3 className="text-xl font-semibold text-[#2d2d2d]">
                            {display.title}
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
          </div>

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
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ink">Sản phẩm nổi bật</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id || product.productId} product={product} />
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
        <div className="min-h-[420px] px-7 py-10 sm:px-10 sm:py-14 lg:min-h-[520px] lg:px-14 lg:py-16">
          <div className="max-w-[760px]">
            <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Cộng đồng người dùng
            </h2>

            <p className="mt-6 max-w-[900px] text-lg leading-9 text-white/90 sm:text-xl">
                  Chia sẻ góc setup, kinh nghiệm sử dụng và cập nhật ưu đãi mới nhất từ Synex.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
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