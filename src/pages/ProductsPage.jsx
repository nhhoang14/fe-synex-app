import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { getBrands, getCategories, getProducts } from '../services/catalogService'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductsPage() {
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [search, setSearch] = useState('')
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
        return productName.includes(search.toLowerCase())
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
  }, [products, search, categoryFilter, brandFilter, sortBy, onlyAvailable, maxPrice])

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
    <div className="products-premium-page">
      <section className="products-premium-hero">
        <div className="products-premium-overlay">
          <h1>Không gian sản phẩm Synex</h1>
          <p>Danh mục setup bàn làm việc, phụ kiện và thiết bị công nghệ được chọn lọc.</p>
        </div>
      </section>

      <section className="products-premium-layout">
        <aside className="products-filter-panel">
          <div className="products-filter-head">
            <h3>Bộ lọc</h3>
          </div>

          <div className="products-filter-group">
            <h4>Loại sản phẩm</h4>
            <div className="category-tile-grid">
              <button
                type="button"
                className={categoryFilter === 'all' ? 'category-tile active' : 'category-tile'}
                onClick={() => setCategoryFilter('all')}
              >
                <span>All</span>
                <small>{products.length}</small>
              </button>
              {categories.slice(0, 9).map((category) => {
                const value = safeText(category?.name || category?.categoryName || '')
                const count = categoryCounts.get(value) || 0
                const isActive = categoryFilter === value.toLowerCase()
                return (
                  <button
                    key={category.id || value}
                    type="button"
                    className={isActive ? 'category-tile active' : 'category-tile'}
                    onClick={() => setCategoryFilter(value.toLowerCase())}
                  >
                    <span>{value || 'Category'}</span>
                    <small>{count}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="products-filter-group">
            <h4>Brand</h4>
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
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

          <div className="products-filter-group">
            <h4>Giá tối đa</h4>
            <input
              type="number"
              min={0}
              placeholder="VD: 2000000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>

          <label className="check-row products-available-check">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
            />
            <span>Chỉ hiển thị sản phẩm còn hàng</span>
          </label>
        </aside>

        <section className="products-catalog-panel">
          <div className="products-catalog-head">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tim theo ten san pham"
            />

            <div className="products-sort-wrap">
              <label htmlFor="sortBy">Sắp xếp theo</label>
              <select id="sortBy" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {feedback && <p className="hint">{feedback}</p>}

          <div className="products-premium-grid">
            {filteredProducts.map((product, index) => {
              const price = safePrice(product)
              const productId = getProductId(product)
              const productName = safeText(getProductName(product), 'Unnamed product')

              return (
                <article className="premium-product-card" key={productId || `${index}-${price}`}>
                  <div className="premium-image-wrap">
                    <img src={getProductImage(product)} alt={productName} />
                  </div>

                  <div className="premium-card-content">
                    <p className="premium-subtitle">Sản phẩm Synex</p>
                    <h3>{productName}</h3>
                    <p className="premium-price-row">
                      <strong>{formatCurrency(price)}</strong>
                    </p>
                    <button type="button" onClick={() => handleAddToCart(product)}>
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
