import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProducts } from '../services/catalogService'
import { formatCurrency, getProductName, getProductPrice } from '../utils/normalizers'
import { useAuth } from '../contexts/AuthContext'

function AdminProductsPage() {
  usePageTitle('Quản lý sản phẩm - Synex')

  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchProductsList() {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductsList()
  }, [])

  async function handleDeleteProduct(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Xóa sản phẩm thất bại')
      
      // Load lại danh sách sau khi xóa
      fetchProductsList()
    } catch (error) {
      alert(error.message)
    }
  }

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product?.stockQuantity || product?.stock || 0), 0),
    [products],
  )

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          ADMIN / PRODUCTS
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
          Quản lý sản phẩm
        </h1>

        <p className="mt-3 max-w-2xl text-slate-700">
          Trang quản lý riêng cho sản phẩm trong khu admin. Không điều hướng sang storefront.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng sản phẩm</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : products.length}
          </strong>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng tồn kho</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : totalStock}
          </strong>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Trang admin</p>
          <Link to={ROUTES.ADMIN} className="mt-2 inline-flex font-semibold text-sky-700">
            Quay lại dashboard
          </Link>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Danh sách sản phẩm</h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Tên sản phẩm</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {products.map((product, index) => {
                const stock = Number(product?.stockQuantity || product?.stock || 0)
                const name = getProductName(product)
                const id = product.id || product.productId

                return (
                  <tr
                    key={id || name || `admin-product-${index}`}
                    className="align-top hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-ink font-medium">{name}</td>

                    <td className="px-4 py-4 text-slate-700">
                      {formatCurrency(getProductPrice(product))}
                    </td>

                    <td className="px-4 py-4 text-slate-700">{stock}</td>

                    <td className="px-4 py-4 text-slate-700">
                      {stock === 0 ? (
                        <span className="text-red-600 font-medium">Hết hàng</span>
                      ) : stock < 10 ? (
                        <span className="text-amber-600 font-medium">Sắp hết</span>
                      ) : (
                        <span className="text-green-600 font-medium">Ổn định</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 text-slate-700">
                      <button 
                        onClick={() => handleDeleteProduct(id)}
                        className="text-red-500 hover:text-red-700 transition font-semibold"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-600">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu sản phẩm.'}
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

export default AdminProductsPage