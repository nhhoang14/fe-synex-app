import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBrands, getCategories, getProducts } from '../services/catalogService'

const QUICK_ACTIONS = [
  {
    title: 'Cap nhat danh muc san pham',
    description: 'Kiem tra ten, icon va thu tu hien thi cac danh muc.',
    to: '/products',
    label: 'Mo catalog',
  },
  {
    title: 'Theo doi tro chuyen khach hang',
    description: 'Tong hop cau hoi, van chuyen, bao hanh va chuyen cho team phu trach.',
    to: '/contact',
    label: 'Mo ho tro',
  },
  {
    title: 'Kiem tra noi dung banner',
    description: 'Dam bao campaign tren trang chu dang dung thong diep va hinh anh.',
    to: '/',
    label: 'Xem storefront',
  },
]

const RECENT_NOTES = [
  { title: 'Cap nhat kho iPhone Cases', detail: 'Tang +120 san pham trong kho va dong bo gia ban.' },
  { title: 'Don doanh nghiep moi', detail: 'Khoi tao bao gia cho 3 bo phan setup van phong.' },
  { title: 'Canh bao chat luong', detail: '2 ticket bao hanh can review bo phan ky thuat.' },
]

function AdminPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  function toObjectArray(data) {
    if (!Array.isArray(data)) return []
    return data.filter((item) => item && typeof item === 'object')
  }

  function safeText(value, fallback = '') {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'object') {
      if ('name' in value && value.name !== null && value.name !== undefined) {
        return String(value.name)
      }
      return fallback
    }
    return String(value)
  }

  useEffect(() => {
    let mounted = true

    setLoading(true)
    Promise.all([getProducts(), getCategories(), getBrands()])
      .then(([productData, categoryData, brandData]) => {
        if (!mounted) return
        setProducts(toObjectArray(productData))
        setCategories(toObjectArray(categoryData))
        setBrands(toObjectArray(brandData))
      })
      .catch(() => {
        if (!mounted) return
        setProducts([])
        setCategories([])
        setBrands([])
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const lowStockCount = useMemo(
    () =>
      products.filter((product) => {
        const stock = Number(product?.stockQuantity || 0)
        return stock > 0 && stock < 10
      }).length,
    [products],
  )
  const featuredProducts = useMemo(() => products.slice(0, 6), [products])

  return (
    <div className="admin-page-shell">
      <section className="admin-hero section-block">
        <div>
          <p className="admin-eyebrow">ADMIN CONTROL CENTER</p>
          <h1>Bang dieu khien quan tri Synex</h1>
          <p>
            Theo doi van hanh cua he thong theo thoi gian thuc, cap nhat danh muc san pham va
            dieu phoi cac dau viec uu tien trong ngay.
          </p>
        </div>
        <div className="admin-hero-actions">
          <Link to="/products" className="primary-link">
            Quan ly san pham
          </Link>
          <Link to="/" className="ghost-link">
            Xem trang khach hang
          </Link>
        </div>
      </section>

      <section className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <p>Tong san pham</p>
          <strong>{loading ? '...' : products.length}</strong>
          <span>Dang hoat dong tren storefront</span>
        </article>
        <article className="admin-kpi-card">
          <p>Danh muc</p>
          <strong>{loading ? '...' : categories.length}</strong>
          <span>Can duoc toi uu bo loc tim kiem</span>
        </article>
        <article className="admin-kpi-card">
          <p>Thuong hieu</p>
          <strong>{loading ? '...' : brands.length}</strong>
          <span>Dang duoc lien ket voi catalog</span>
        </article>
        <article className="admin-kpi-card warn">
          <p>Canh bao ton kho thap</p>
          <strong>{loading ? '...' : lowStockCount}</strong>
          <span>San pham con duoi 10 don vi</span>
        </article>
      </section>

      <section className="admin-content-grid">
        <article className="section-block admin-panel">
          <h2>Quan ly nhanh</h2>
          <div className="admin-action-list">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.title} className="admin-action-item">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <Link to={action.to}>{action.label}</Link>
              </div>
            ))}
          </div>
        </article>

        <article className="section-block admin-panel">
          <h2>Ghi chu van hanh</h2>
          <div className="admin-note-list">
            {RECENT_NOTES.map((note) => (
              <div key={note.title} className="admin-note-item">
                <strong>{note.title}</strong>
                <p>{note.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="section-block admin-panel">
        <div className="admin-table-head">
          <h2>San pham noi bat can theo doi</h2>
          <Link to="/products">Mo trang catalog</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ten san pham</th>
                <th>Danh muc</th>
                <th>Gia</th>
                <th>Ton kho</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {featuredProducts.map((product, index) => {
                const stock = Number(product?.stockQuantity || 0)
                const category = safeText(
                  product?.category?.name || product?.categoryName || product?.category,
                  'Chua phan loai',
                )
                const productName = safeText(product?.name || product?.productName, 'San pham khong ten')
                const statusLabel = stock === 0 ? 'Het hang' : stock < 10 ? 'Sap het' : 'On dinh'

                return (
                  <tr key={product.id || product.productId || productName || `product-${index}`}>
                    <td>{productName}</td>
                    <td>{category}</td>
                    <td>{Number(product.price || 0).toLocaleString('vi-VN')} đ</td>
                    <td>{stock}</td>
                    <td>
                      <span className={`admin-status-chip ${stock < 10 ? 'is-warn' : 'is-ok'}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {featuredProducts.length === 0 && (
                <tr>
                  <td colSpan={5}>Chua co du lieu san pham de hien thi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminPage
