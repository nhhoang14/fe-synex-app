import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProducts } from '../services/catalogService'

const QUICK_ACTIONS = [
  {
    title: 'Cập nhật danh mục sản phẩm',
    description: 'Kiểm tra tên, icon và thứ tự hiển thị các danh mục.',
    to: ROUTES.PRODUCTS,
    label: 'Mở catalog',
  },
  {
    title: 'Theo dõi trò chuyện khách hàng',
    description: 'Tổng hợp câu hỏi, vận chuyển, bảo hành và chuyển cho team phụ trách.',
    to: ROUTES.CONTACT,
    label: 'Mở hỗ trợ',
  },
  {
    title: 'Kiểm tra nội dung banner',
    description: 'Đảm bảo campaign trên trang chủ đang đúng thông điệp và hình ảnh.',
    to: ROUTES.HOME,
    label: 'Xem trang chủ',
  },
]

const RECENT_NOTES = [
  { title: 'Cập nhật kho iPhone Cases', detail: 'Tăng số lượng sản phẩm trong kho và đồng bộ giá bán.' },
  { title: 'Kiểm tra đơn hàng mới', detail: 'Theo dõi các đơn mới phát sinh để xử lý kịp thời.' },
  { title: 'Cảnh báo chất lượng', detail: 'Kiểm tra các sản phẩm sắp hết hàng hoặc cần cập nhật thông tin.' },
]

function AdminPage() {
  usePageTitle('Quản trị - Synex')

  const { token } = useAuth()
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
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

    async function bootstrapDashboard() {
      setLoading(true)

      try {
        const productData = await getProducts()
        if (mounted) setProducts(toObjectArray(productData))
      } catch {
        if (mounted) setProducts([])
      }

      try {
        const catRes = await fetch(`${API_URL}/api/admin/categories`, { headers: { Authorization: `Bearer ${token}` } })
        const categoryData = await catRes.json()
        if (mounted) setCategories(toObjectArray(categoryData))
      } catch {
        if (mounted) setCategories([])
      }

      try {
        const brandRes = await fetch(`${API_URL}/api/admin/brands`, { headers: { Authorization: `Bearer ${token}` } })
        const brandData = await brandRes.json()
        if (mounted) setBrands(toObjectArray(brandData))
      } catch {
        if (mounted) setBrands([])
      }

      if (mounted) setLoading(false)
    }

    if (token) bootstrapDashboard()

    return () => { mounted = false }
  }, [token])

  const categoryCount = useMemo(() => {
    if (categories.length > 0) return categories.length
    const categoryNames = new Set()
    products.forEach((product) => {
      const categoryName = product?.category?.name || product?.categoryName || product?.category
      const normalizedName = safeText(categoryName)
      if (normalizedName) categoryNames.add(normalizedName)
    })
    return categoryNames.size
  }, [categories, products])

  const lowStockCount = useMemo(
    () => products.filter((product) => {
        const stock = Number(product?.stockQuantity || product?.stock || 0)
        return stock > 0 && stock < 10
      }).length,
    [products],
  )

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product?.stockQuantity || product?.stock || 0), 0),
    [products],
  )

  const featuredProducts = useMemo(() => products.slice(0, 6), [products])

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-[28px] border border-border bg-white p-8 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            ADMIN CONTROL CENTER
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Bảng điều khiển quản trị Synex
          </h1>

          <p className="mt-3 text-slate-700">
            Theo dõi tổng quan sản phẩm, danh mục, thương hiệu và tình trạng tồn kho của hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={ROUTES.ADMIN_PRODUCTS}
            className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Mở quản lý sản phẩm
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng sản phẩm</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : products.length}
          </strong>
          <span className="mt-2 block text-sm text-slate-600">
            Đang hiển thị trên trang sản phẩm
          </span>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Danh mục</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : categoryCount}
          </strong>
          <span className="mt-2 block text-sm text-slate-600">
            Đang được sử dụng trong bộ lọc sản phẩm
          </span>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Thương hiệu</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : brands.length}
          </strong>
          <span className="mt-2 block text-sm text-slate-600">
            Đang được liên kết với sản phẩm
          </span>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Cảnh báo tồn kho thấp</p>
          <strong className="mt-2 block text-3xl font-bold text-amber-900">
            {loading ? '...' : lowStockCount}
          </strong>
          <span className="mt-2 block text-sm text-amber-800">
            Sản phẩm còn dưới 10 đơn vị
          </span>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng tồn kho</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : totalStock}
          </strong>
          <span className="mt-2 block text-sm text-slate-600">
            Tổng số lượng sản phẩm còn trong kho
          </span>
        </article>

        <article className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Sản phẩm theo dõi</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : featuredProducts.length}
          </strong>
          <span className="mt-2 block text-sm text-slate-600">
            Sản phẩm được hiển thị nhanh trong bảng bên dưới
          </span>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Quản lý nhanh</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.title} className="rounded-2xl border border-border bg-slate-50 p-4">
                <h3 className="text-xl font-bold text-ink">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{action.description}</p>

                <Link
                  to={action.to}
                  className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                >
                  {action.label}
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Ghi chú vận hành</h2>

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
          <h2 className="text-2xl font-bold text-ink">Sản phẩm nổi bật cần theo dõi</h2>

          <Link to={ROUTES.ADMIN_PRODUCTS} className="font-semibold text-sky-700">
            Mở quản lý sản phẩm
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Tên sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {featuredProducts.map((product, index) => {
                const stock = Number(product?.stockQuantity || product?.stock || 0)
                const category = safeText(
                  product?.category?.name || product?.categoryName || product?.category,
                  'Chưa phân loại',
                )
                const productName = safeText(
                  product?.name || product?.productName,
                  'Sản phẩm không tên',
                )

                const statusLabel = stock === 0 ? 'Hết hàng' : stock < 10 ? 'Sắp hết' : 'Ổn định'

                return (
                  <tr
                    key={product.id || product.productId || productName || `product-${index}`}
                    className="align-top hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-ink font-medium">{productName}</td>
                    <td className="px-4 py-4 text-slate-700">{category}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {Number(product.price || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-bold">{stock}</td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                          stock === 0 ? 'bg-red-100 text-red-800' :
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
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-600">
                    {loading ? 'Đang tải dữ liệu sản phẩm...' : 'Chưa có dữ liệu sản phẩm để hiển thị.'}
                  </td>
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