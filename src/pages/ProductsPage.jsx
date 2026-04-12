import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  const [feedback, setFeedback] = useState('')

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
    Promise.all([getProducts(), getCategories(), getBrands()])
      .then(([productData, categoryData, brandData]) => {
        setProducts(toObjectArray(productData))
        setCategories(toObjectArray(categoryData))
        setBrands(toObjectArray(brandData))
      })
      .catch(() => {
        setProducts([])
        setCategories([])
        setBrands([])
      })
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
      const name = safeText(product?.category?.name || product?.categoryName || 'Other')
      map.set(name, (map.get(name) || 0) + 1)
    })
    return map
  }, [products])

  async function handleAddToCart(product) {
    const productId = getProductId(product)
    if (!productId) {
      setFeedback('Không tim thay product id')
      return
    }

    try {
      await addToCart(productId, 1)
      setFeedback(`Da them ${getProductName(product)} vao gio hang`)
    } catch (error) {
      setFeedback(error.message)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-slate-950 p-8 text-white shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Không gian sản phẩm Synex</h1>
          <p className="mt-3 text-base text-slate-200 sm:text-lg">
            Danh mục setup bàn làm việc, phụ kiện và thiết bị công nghệ được chọn lọc.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="border-b border-border pb-3">
            <h3 className="text-2xl font-bold text-ink">Bộ lọc</h3>
          </div>

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
                <span className="font-medium">All</span>
                <small className="text-slate-500">{products.length}</small>
              </button>
              {categories.slice(0, 9).map((category) => {
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
                    <span className="font-medium">{value || 'Category'}</span>
                    <small className="text-slate-500">{count}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-ink">Brand</h4>
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

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
            />
            <span className="text-sm font-medium text-ink">Chỉ hiển thị sản phẩm còn hàng</span>
          </label>
        </aside>

        <section className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-sm text-slate-600">
              {keywordFilter ? `Kết quả cho "${keywordFilter}"` : 'Duyệt toàn bộ sản phẩm'}
            </p>

            <div className="flex flex-col gap-2 lg:min-w-64">
              <label htmlFor="sortBy" className="text-sm font-medium text-ink">
                Sắp xếp theo
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {feedback && <p className="text-sm font-medium text-slate-600">{feedback}</p>}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const price = safePrice(product)
              const productId = getProductId(product)
              const productName = safeText(getProductName(product), 'Unnamed product')

              return (
                <article
                  className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
                  key={productId || `${index}-${price}`}
                >
                  <div className="overflow-hidden">
                    <img src={getProductImage(product)} alt={productName} className="aspect-[4/3] w-full object-cover" />
                  </div>

                  <div className="flex flex-col gap-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Sản phẩm Synex</p>
                    <h3 className="text-xl font-bold text-ink">{productName}</h3>
                    <p className="text-lg font-semibold text-slate-900">
                      <strong>{formatCurrency(price)}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="mt-1 rounded-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>
    </div>
  )
}

export default ProductsPage
