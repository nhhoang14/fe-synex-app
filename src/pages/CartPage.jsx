import { useEffect, useState, useMemo } from 'react'
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
  const { items, fetchCart, increase, decrease, remove } = useCart()
  const [message, setMessage] = useState('')
  
  // State quản lý danh sách ID các sản phẩm được tick chọn
  const [selectedItemIds, setSelectedItemIds] = useState([])

  const shippingFee = 0

  // Lấy ra tất cả ID hợp lệ trong giỏ hàng để dùng cho nút "Chọn tất cả"
  const allItemIds = useMemo(() => {
    return items.map(item => item.id || getProductId(getCartItemProduct(item)))
  }, [items])

  // Tính tổng tiền CHỈ cho những sản phẩm được tick
  const selectedTotalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const product = getCartItemProduct(item)
      const productId = getProductId(product)
      const uniqueId = item.id || productId

      if (selectedItemIds.includes(uniqueId)) {
        const quantity = getCartItemQuantity(item)
        const price = getProductPrice(product)
        return total + (price * quantity)
      }
      return total
    }, 0)
  }, [items, selectedItemIds])

  const grandTotal = selectedTotalAmount + shippingFee

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {
        setMessage('Không tải được giỏ hàng.')
      })
    }
  }, [isAuthenticated, fetchCart])

  // Xử lý tick/bỏ tick một sản phẩm
  function handleSelect(id) {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    )
  }

  // Xử lý tick/bỏ tick tất cả sản phẩm
  function handleSelectAll() {
    if (selectedItemIds.length === allItemIds.length && allItemIds.length > 0) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(allItemIds)
    }
  }

  async function handleIncrease(productId) {
    if (!isAuthenticated) return
    try {
      await increase(productId, 1)
      await fetchCart() // Tự động đồng bộ lại giỏ hàng sau khi tăng
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDecrease(productId) {
    if (!isAuthenticated) return
    try {
      await decrease(productId, 1)
      await fetchCart() // Tự động đồng bộ lại giỏ hàng sau khi giảm
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleRemove(productId) {
    if (!isAuthenticated) return
    try {
      await remove(productId)
      await fetchCart() // Tự động đồng bộ lại giỏ hàng sau khi xóa
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* BANNER MỚI: 1 khối dài, căn giữa giống trang thanh toán */}
      <section className="flex flex-col items-center justify-center rounded-[28px] border border-border bg-slate-50 py-10 px-6 text-center shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-ink font-heading">
          Giỏ hàng của bạn
        </h1>
        <p className="mt-3 text-slate-600">
          {isAuthenticated
            ? `Bạn đang có ${String(items.length).padStart(2, '0')} sản phẩm trong giỏ hàng.`
            : 'Cần đăng nhập hợp lệ để tải và cập nhật dữ liệu giỏ hàng.'}
        </p>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-2xl font-bold text-ink">Sản phẩm trong giỏ</h2>
            <div className="flex flex-wrap gap-3">
              <Link to={ROUTES.PRODUCTS} className="rounded-full border border-border bg-white px-4 py-2 font-semibold text-ink transition hover:bg-slate-50">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {message && <p className="text-sm font-medium text-slate-600">{message}</p>}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-slate-50 py-16 px-6 text-center">
              <p className="text-slate-700 font-medium">
                {isAuthenticated
                  ? 'Giỏ hàng đang trống. Hãy thêm sản phẩm để tiếp tục thanh toán.'
                  : 'Không tải được giỏ hàng. Hãy đăng nhập trước.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 w-12 text-center"></th>
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
                    const uniqueId = item.id || productId

                    return (
                      <tr key={uniqueId} className="align-top">
                        <td className="px-4 py-4 align-middle text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                            checked={selectedItemIds.includes(uniqueId)}
                            onChange={() => handleSelect(uniqueId)}
                          />
                        </td>
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
                
                <tfoot className="border-t border-border bg-slate-50">
                  <tr>
                    <td className="px-4 py-4 align-middle text-center">
                      <input
                        type="checkbox"
                        id="selectAllBottom"
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                        checked={selectedItemIds.length === allItemIds.length && allItemIds.length > 0}
                        onChange={handleSelectAll}
                      />
                    </td>
                    <td colSpan="5" className="px-4 py-4">
                      <label htmlFor="selectAllBottom" className="cursor-pointer text-sm font-semibold text-ink hover:text-slate-700">
                        Chọn tất cả ({items.length} sản phẩm)
                      </label>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {/* THÊM TÍNH NĂNG TRƯỢT THEO BẰNG "sticky" và "top-24" */}
        <aside className="sticky top-24 h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-ink">Tóm tắt đơn hàng</h3>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-slate-700">
              <span>Tạm tính</span>
              <strong>{formatCurrency(selectedTotalAmount)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Phí vận chuyển</span>
              <strong>{formatCurrency(shippingFee)}</strong>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-lg font-bold text-ink">
            <span>Tổng cộng</span>
            <strong className="text-red-600">{formatCurrency(grandTotal)}</strong>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              to={isAuthenticated && selectedItemIds.length > 0 ? ROUTES.CHECKOUT : ROUTES.LOGIN}
              className={`rounded-full px-5 py-3 text-center font-semibold transition ${
                selectedItemIds.length > 0 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default CartPage