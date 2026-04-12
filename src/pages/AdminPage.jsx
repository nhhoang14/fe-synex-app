import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { usePageTitle } from '../hooks/usePageTitle'
import { getBrands, getCategories, getProducts } from '../services/catalogService'

const QUICK_ACTIONS = [
  {
    title: 'Cap nhat danh muc san pham',
    description: 'Kiem tra ten, icon va thu tu hien thi cac danh muc.',
    to: ROUTES.PRODUCTS,
    label: 'Mo catalog',
  },
  {
    title: 'Theo doi tro chuyen khach hang',
    description: 'Tong hop cau hoi, van chuyen, bao hanh va chuyen cho team phu trach.',
    to: ROUTES.CONTACT,
    label: 'Mo ho tro',
  },
  {
    title: 'Kiem tra noi dung banner',
    description: 'Dam bao campaign tren trang chu dang dung thong diep va hinh anh.',
    to: ROUTES.HOME,
    label: 'Xem storefront',
  },
]

const RECENT_NOTES = [
  { title: 'Cap nhat kho iPhone Cases', detail: 'Tang +120 san pham trong kho va dong bo gia ban.' },
  { title: 'Don doanh nghiep moi', detail: 'Khoi tao bao gia cho 3 bo phan setup van phong.' },
  { title: 'Canh bao chat luong', detail: '2 ticket bao hanh can review bo phan ky thuat.' },
]

function AdminPage() {
  usePageTitle('Quản trị - Synex')

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

    async function bootstrapDashboard() {
      setLoading(true)
      try {
        const [productData, categoryData, brandData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ])

        if (!mounted) return
        setProducts(toObjectArray(productData))
        setCategories(toObjectArray(categoryData))
        setBrands(toObjectArray(brandData))
      } catch {
        if (!mounted) return
        setProducts([])
        setCategories([])
        setBrands([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    bootstrapDashboard()

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
    <div className="space-y-4">
      <section className="grid gap-4 rounded-[28px] border border-border bg-white p-8 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">ADMIN CONTROL CENTER</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Bang dieu khien quan tri Synex</h1>
          <p className="mt-3 text-slate-700">
            Theo doi van hanh cua he thong theo thoi gian thuc, cap nhat danh muc san pham va
            dieu phoi cac dau viec uu tien trong ngay.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.ADMIN_PRODUCTS} className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
            Mo quan ly san pham
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tong san pham</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : products.length}</strong>
          <span className="mt-2 block text-sm text-slate-600">Dang hoat dong tren storefront</span>
        </article>
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Danh muc</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : categories.length}</strong>
          <span className="mt-2 block text-sm text-slate-600">Can duoc toi uu bo loc tim kiem</span>
        </article>
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Thuong hieu</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : brands.length}</strong>
          <span className="mt-2 block text-sm text-slate-600">Dang duoc lien ket voi catalog</span>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Canh bao ton kho thap</p>
          <strong className="mt-2 block text-3xl font-bold text-amber-900">{loading ? '...' : lowStockCount}</strong>
          <span className="mt-2 block text-sm text-amber-800">San pham con duoi 10 don vi</span>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Quan ly nhanh</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.title} className="rounded-2xl border border-border bg-slate-50 p-4">
                <h3 className="text-xl font-bold text-ink">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{action.description}</p>
                <Link to={action.to} className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800">
                  {action.label}
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Ghi chu van hanh</h2>
          <div className="mt-4 space-y-3">
            {RECENT_NOTES.map((note) => (
              <div key={note.title} className="rounded-2xl border border-border bg-slate-50 p-4">
                <strong className="block text-ink">{note.title}</strong>
                <p className="mt-1 text-sm text-slate-700">{note.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-bold text-ink">San pham noi bat can theo doi</h2>
          <Link to={ROUTES.PRODUCTS} className="font-semibold text-sky-700">
            Mo trang catalog
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Ten san pham</th>
                <th className="px-4 py-3">Danh muc</th>
                <th className="px-4 py-3">Gia</th>
                <th className="px-4 py-3">Ton kho</th>
                <th className="px-4 py-3">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {featuredProducts.map((product, index) => {
                const stock = Number(product?.stockQuantity || 0)
                const category = safeText(
                  product?.category?.name || product?.categoryName || product?.category,
                  'Chua phan loai',
                )
                const productName = safeText(product?.name || product?.productName, 'San pham khong ten')
                const statusLabel = stock === 0 ? 'Het hang' : stock < 10 ? 'Sap het' : 'On dinh'

                return (
                  <tr key={product.id || product.productId || productName || `product-${index}`} className="align-top">
                    <td className="px-4 py-4 text-ink">{productName}</td>
                    <td className="px-4 py-4 text-slate-700">{category}</td>
                    <td className="px-4 py-4 text-slate-700">{Number(product.price || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="px-4 py-4 text-slate-700">{stock}</td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                          stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
                        ].join(' ')}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {featuredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-600">Chua co du lieu san pham de hien thi.</td>
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
