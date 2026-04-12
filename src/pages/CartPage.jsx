import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  formatCurrency,
  getCartItemProduct,
  getCartItemQuantity,
  getProductImage,
  getProductId,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function CartPage() {
  usePageTitle('Giỏ hàng - Synex')

  const { isAuthenticated } = useAuth()
  const { items, totalAmount, fetchCart, openCart, increase, decrease, remove } = useCart()
  const [message, setMessage] = useState('')

  const shippingFee = 0
  const grandTotal = totalAmount + shippingFee

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {
        setMessage('Không tai được gio hang')
      })
    }
  }, [isAuthenticated, fetchCart])

  async function ensureCart() {
    if (!isAuthenticated) {
      setMessage('Vui long dang nhap hop le de tai va cap nhat du lieu gio hang.')
      return
    }

    try {
      await openCart()
      setMessage('Da tao/lay gio hang hien tai')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleIncrease(productId) {
    if (!isAuthenticated) return

    try {
      await increase(productId, 1)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDecrease(productId) {
    if (!isAuthenticated) return

    try {
      await decrease(productId, 1)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleRemove(productId) {
    if (!isAuthenticated) return

    try {
      await remove(productId)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">GIO HANG SYNEX</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Giỏ hàng cua ban</h1>
        </article>

        <article className="rounded-[28px] border border-border bg-slate-950 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">GIO HANG</p>
          <h2 className="mt-2 text-3xl font-bold">{String(items.length).padStart(2, '0')} san pham</h2>
          <p className="mt-3 text-slate-200">
            {isAuthenticated
              ? 'Ban co the tang giam so luong va xoa nhanh tung san pham trong gio.'
              : 'Can dang nhap hop le de tai va cap nhat du lieu gio hang.'}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-2xl font-bold text-ink">Sản phẩm trong gio</h2>
            <div className="flex flex-wrap gap-3">
              <Link to={ROUTES.PRODUCTS} className="rounded-full border border-border bg-white px-4 py-2 font-semibold text-ink transition hover:bg-slate-50">
                Tiếp tục mua sắm
              </Link>
              <button type="button" className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800" onClick={ensureCart}>
                Làm mới
              </button>
            </div>
          </div>

          {message && <p className="text-sm font-medium text-slate-600">{message}</p>}

          {items.length === 0 ? (
            <p className="text-slate-700">
              {isAuthenticated
                ? 'Giỏ hàng dang trong. Hay them san pham de tiep tuc thanh toan.'
                : 'Không tai được gio hang. Hay dang nhap truoc.'}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Đơn giá</th>
                  <th className="px-4 py-3">Số lượng</th>
                  <th className="px-4 py-3">Thành tiền</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const product = getCartItemProduct(item)
                  const productId = getProductId(product)
                  const quantity = getCartItemQuantity(item)
                  const price = getProductPrice(product)

                  return (
                    <tr key={item.id || `${productId}-${quantity}`} className="align-top">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                          <span className="font-medium text-ink">{getProductName(product)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{formatCurrency(price)}</td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-2 py-2">
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded-full bg-white font-semibold text-ink transition hover:bg-slate-100"
                            onClick={() => handleDecrease(productId)}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center font-semibold text-ink">{quantity}</span>
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded-full bg-white font-semibold text-ink transition hover:bg-slate-100"
                            onClick={() => handleIncrease(productId)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{formatCurrency(price * quantity)}</td>
                      <td className="px-4 py-4">
                        <div className="flex">
                          <button
                            type="button"
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-100"
                            onClick={() => handleRemove(productId)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-ink">Tóm tắt đơn hàng</h3>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-slate-700">
              <span>Tạm tính</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Phí vận chuyển</span>
              <strong>{formatCurrency(shippingFee)}</strong>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-lg font-bold text-ink">
            <span>Tổng cộng</span>
            <strong>{formatCurrency(grandTotal)}</strong>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              to={isAuthenticated && items.length > 0 ? ROUTES.CHECKOUT : ROUTES.LOGIN}
              className="rounded-full bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
            >
              Tiến hành thanh toán
            </Link>

            <Link to={ROUTES.PRODUCTS} className="rounded-full border border-border bg-white px-5 py-3 text-center font-semibold text-ink transition hover:bg-slate-50">
              Tiếp tục mua sắm
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default CartPage
