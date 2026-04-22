import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProducts } from '../services/catalogService'
import { formatCurrency, getProductName, getProductPrice } from '../utils/normalizers'

function AdminProductsPage() {
  usePageTitle('Quan ly san pham - Synex')

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrapProducts() {
      setLoading(true)
      try {
        const data = await getProducts()
        if (!active) return
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        if (!active) return
        setProducts([])
      } finally {
        if (active) setLoading(false)
      }
    }

    bootstrapProducts()

    return () => {
      active = false
    }
  }, [])

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product?.stockQuantity || 0), 0),
    [products],
  )

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">ADMIN / PRODUCTS</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Quan ly san pham</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Trang quan ly rieng cho san pham trong khu admin. Khong dieu huong sang storefront.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tong san pham</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : products.length}</strong>
        </article>
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tong ton kho</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">{loading ? '...' : totalStock}</strong>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Danh sach san pham</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Ten san pham</th>
                <th className="px-4 py-3">Gia</th>
                <th className="px-4 py-3">Ton kho</th>
                <th className="px-4 py-3">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product, index) => {
                const stock = Number(product?.stockQuantity || 0)
                const name = getProductName(product)

                return (
                  <tr key={product.id || product.productId || name || `admin-product-${index}`} className="align-top">
                    <td className="px-4 py-4 text-ink">{name}</td>
                    <td className="px-4 py-4 text-slate-700">{formatCurrency(getProductPrice(product))}</td>
                    <td className="px-4 py-4 text-slate-700">{stock}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {stock === 0 ? 'Het hang' : stock < 10 ? 'Sap het' : 'On dinh'}
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-600">
                    Chua co du lieu san pham.
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
