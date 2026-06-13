import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getBrands, getCategories, getProducts } from '../services/catalogService'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductsPage() {
  usePageTitle('Sản phẩm - Synex')

  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [brandFilter, setBrandFilter] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [likedIds, setLikedIds] = useState([])

  // State Toast Notification
  const [feedback, setFeedback] = useState('')
  const [progress, setProgress] = useState(100)

  const productsPerPage = 12

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

  function toObjectArray(data) {
    if (!Array.isArray(data)) return []
    return data.filter((item) => item && typeof item === 'object')
  }

  function safeText(value, fallback = '') {
    if (value === null || value === undefined) return fallback
    return String(value)
  }

  function safePrice(product) {
    const price = Number(getProductPrice(product))
    return Number.isFinite(price) ? price : 0
  }

  function normalizeCategory(value = '') {
    return String(value).trim().toLowerCase()
  }

  function loadLikedIds() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLikedIds(wishlist.map((item) => getProductId(item)).filter(Boolean))
  }

  const categoryFilter = normalizeCategory(searchParams.get('category') || 'all')
  const keywordFilter = String(searchParams.get('q') || '').trim().toLowerCase()

  function setCategoryFilter(nextCategory) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      const normalized = normalizeCategory(nextCategory)

      if (!normalized || normalized === 'all') {
        params.delete('category')
      } else {
        params.set('category', normalized)
      }

      return params
    })
  }

  useEffect(() => {
    async function loadData() {
      try {
        const productData = await getProducts()
        setProducts(toObjectArray(productData))
      } catch {
        setProducts([])
      }

      try {
        const categoryData = await getCategories()
        setCategories(toObjectArray(categoryData))
      } catch {
        setCategories([])
      }

      try {
        const brandData = await getBrands()
        setBrands(toObjectArray(brandData))
      } catch {
        setBrands([])
      }
    }

    loadData()
    loadLikedIds()

    window.addEventListener('wishlistUpdated', loadLikedIds)

    return () => {
      window.removeEventListener('wishlistUpdated', loadLikedIds)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const categoryValue = categoryFilter.toLowerCase()
    const brandValue = brandFilter.toLowerCase()

    return [...products]
      .filter((product) => {
        const productName = safeText(getProductName(product)).toLowerCase()
        return productName.includes(keywordFilter)
      })
      .filter((product) => {
        if (categoryValue === 'all') return true

        const categoryName = safeText(
          product?.category?.name || product?.categoryName || '',
        ).toLowerCase()

        return categoryName === categoryValue
      })
      .filter((product) => {
        if (brandValue === 'all') return true

        const brandName = safeText(
          product?.brand?.name || product?.brandName || '',
        ).toLowerCase()

        return brandName === brandValue
      })
      .filter((product) => {
        if (!onlyAvailable) return true

        if (typeof product?.available === 'boolean') return product.available
        if (typeof product?.stock === 'number') return product.stock > 0
        if (typeof product?.stockQuantity === 'number') return product.stockQuantity > 0

        return true
      })
      .filter((product) => {
        if (!maxPrice) return true
        return safePrice(product) <= Number(maxPrice)
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') {
          return safeText(getProductName(a)).localeCompare(safeText(getProductName(b)))
        }

        if (sortBy === 'name-desc') {
          return safeText(getProductName(b)).localeCompare(safeText(getProductName(a)))
        }

        if (sortBy === 'price-asc') {
          return safePrice(a) - safePrice(b)
        }

        return safePrice(b) - safePrice(a)
      })
  }, [products, keywordFilter, categoryFilter, brandFilter, sortBy, onlyAvailable, maxPrice])

  const categoryCounts = useMemo(() => {
    const map = new Map()

    products.forEach((product) => {
      const name = safeText(product?.category?.name || product?.categoryName || 'Khác')
      map.set(name, (map.get(name) || 0) + 1)
    })

    return map
  }, [products])

  const displayCategories = useMemo(() => {
    if (categories.length > 0) return categories

    return Array.from(categoryCounts.keys()).map((name, index) => ({
      id: `fallback-category-${index}`,
      name,
    }))
  }, [categories, categoryCounts])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [keywordFilter, categoryFilter, brandFilter, sortBy, onlyAvailable, maxPrice])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  async function handleAddToCart(product) {
    const productId = getProductId(product)

    if (!productId) {
      setFeedback('Không tìm thấy và xác định được mã ID sản phẩm.')
      return
    }

    try {
      await addToCart(productId, 1)
      setFeedback(`Đã thêm ${getProductName(product)} vào giỏ hàng thành công!`)
    } catch (error) {
      setFeedback(error.message)
    }
  }

  function handleToggleWishlist(event, product) {
    event.preventDefault()
    event.stopPropagation()

    const productId = getProductId(product)
    if (!productId) return

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const exists = wishlist.some((item) => getProductId(item) === productId)

    const newWishlist = exists
      ? wishlist.filter((item) => getProductId(item) !== productId)
      : [...wishlist, product]

    localStorage.setItem('wishlist', JSON.stringify(newWishlist))
    setLikedIds(newWishlist.map((item) => getProductId(item)).filter(Boolean))
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const isSuccess = feedback.toLowerCase().includes('đã') || feedback.toLowerCase().includes('thành công')

  return (
    <div className="space-y-4">
      {/* TOAST THÔNG BÁO NỔI DẠNG OVERLAY */}
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

      {/* Banner */}
      <section className="rounded-[28px] border border-border bg-slate-950 p-8 text-white shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Không gian sản phẩm Synex
          </h1>
          <p className="mt-3 text-base text-slate-200 sm:text-lg">
            Danh mục setup bàn làm việc, phụ kiện và thiết bị công nghệ được chọn lọc.
          </p>
        </div>
      </section>

      {/* THANH TIÊU ĐỀ NẰM NGANG (Bộ lọc và Sắp xếp nằm cùng 1 hàng) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 pt-2">
        {/* Cột Bộ lọc (Bằng đúng chiều rộng của cột Filter bên dưới để chuẩn layout) */}
        <div className="lg:w-[280px]">
          <h3 className="text-2xl font-bold text-ink">Bộ lọc</h3>
        </div>
        
        {/* Cột Sắp xếp theo (Nằm ngang hàng, dồn sang phải) */}
        <div className="flex items-center gap-3">
          <label htmlFor="sortBy" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            Sắp xếp theo
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="min-w-[180px] rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 font-medium text-ink"
          >
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      <section className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        {/* Bộ lọc bên trái */}
        <aside className="filter-scrollbar sticky top-24 max-h-[calc(100vh-120px)] space-y-5 overflow-y-auto pr-2 pt-1">
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-ink">Loại sản phẩm</h4>

            <div className="grid gap-2">
              <button
                type="button"
                className={[
                  'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                  categoryFilter === 'all'
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-border bg-slate-50 text-ink hover:bg-white',
                ].join(' ')}
                onClick={() => setCategoryFilter('all')}
              >
                <span className="font-medium">Tất cả</span>
                <small className="text-slate-500">{products.length}</small>
              </button>

              {displayCategories.slice(0, 9).map((category) => {
                const value = safeText(category?.name || category?.categoryName || '')
                const count = categoryCounts.get(value) || 0
                const isActive = categoryFilter === value.toLowerCase()

                return (
                  <button
                    key={category.id || value}
                    type="button"
                    className={[
                      'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                      isActive
                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                        : 'border-border bg-slate-50 text-ink hover:bg-white',
                    ].join(' ')}
                    onClick={() => setCategoryFilter(value.toLowerCase())}
                  >
                    <span className="font-medium">{value || 'Danh mục'}</span>
                    <small className="text-slate-500">{count}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-ink">Thương hiệu</h4>

            <select
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">Tất cả thương hiệu</option>
              {brands.map((brand) => {
                const value = safeText(brand?.name || brand?.brandName || '')
                return (
                  <option key={brand.id || value} value={value.toLowerCase()}>
                    {value}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-ink">Giá tối đa</h4>
            <input
              type="number"
              min={0}
              placeholder="VD: 2000000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-ink">
              Chỉ hiển thị sản phẩm còn hàng
            </span>
          </label>
        </aside>

        {/* Khu vực danh sách sản phẩm */}
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product, index) => {
              const price = safePrice(product)
              const productId = getProductId(product)
              const productName = safeText(getProductName(product), 'Sản phẩm chưa đặt tên')
              const productLink = `/products/${productId}`
              const isLiked = likedIds.includes(productId)

              return (
                <article
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
                  key={productId || `${index}-${price}`}
                >
                  <button
                    type="button"
                    onClick={(event) => handleToggleWishlist(event, product)}
                    className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/90 text-2xl opacity-0 shadow-sm transition hover:scale-105 group-hover:opacity-100"
                    aria-label="Thích sản phẩm"
                  >
                    <span className={isLiked ? 'text-red-500' : 'text-slate-500'}>
                      {isLiked ? '♥' : '♡'}
                    </span>
                  </button>

                  <Link to={productLink} className="flex h-full flex-col">
                    <div className="overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={productName}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                        Sản phẩm Synex
                      </p>

                      <h3 className="mt-3 min-h-[64px] text-xl font-bold leading-snug text-ink hover:text-sky-700 line-clamp-2">
                        {productName}
                      </h3>

                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        <strong>{formatCurrency(price)}</strong>
                      </p>
                    </div>
                  </Link>

                  <div className="px-5 pb-5 mt-auto">
                    <Link
                      to={productLink}
                      className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-slate-500">
              Không tìm thấy phụ kiện nào phù hợp với bộ lọc hiện tại.
            </div>
          )}

          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Trang trước"
                >
                  ‹
                </button>

                <div className="min-w-[64px] text-center text-lg text-slate-800">
                  <span>{currentPage}</span>
                  <span className="px-2 text-slate-400">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Trang sau"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

export default ProductsPage