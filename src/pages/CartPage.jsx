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
  
  // State quản lý mã khuyến mãi (UI demo)
  const [promoCode, setPromoCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

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

  // Tính tổng tạm tính cuối cùng (sau khi trừ khuyến mãi)
  const finalTotal = Math.max(0, selectedTotalAmount - discountAmount)

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

  // Hàm xử lý áp dụng mã khuyến mãi (Giả lập UI)
  function handleApplyPromoCode() {
    if (!promoCode.trim()) {
      alert('Vui lòng nhập mã khuyến mãi!')
      return
    }
    // Giả lập logic: Nếu mã là "SYNEX10", giảm 10% tổng đơn, tối đa 500k
    if (promoCode.trim().toUpperCase() === 'SYNEX10') {
      const discount = Math.min(selectedTotalAmount * 0.1, 500000)
      setDiscountAmount(discount)
      alert('Áp dụng mã khuyến mãi thành công!')
    } else {
      setDiscountAmount(0)
      alert('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.')
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

      <section className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
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
                    <th className="px-4 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                        checked={selectedItemIds.length === allItemIds.length && allItemIds.length > 0}
                        onChange={handleSelectAll}
                        title="Chọn tất cả"
                      />
                    </th>
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
                    const productName = getProductName(product)
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
                          <Link 
                            to={`/products/${productId}`} 
                            className="flex items-center gap-3 group transition-opacity hover:opacity-80"
                          >
                            <img
                              src={getProductImage(product)}
                              alt={productName}
                              className="h-14 w-14 rounded-2xl object-cover shrink-0"
                            />
                            {/* line-clamp-2 giúp text chỉ hiện tối đa 2 dòng, tự thêm "..." nếu quá dài */}
                            <span 
                              className="font-medium text-ink group-hover:text-sky-700 transition-colors line-clamp-2"
                              title={productName}
                            >
                              {productName}
                            </span>
                          </Link>
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

        {/* BẢNG TÓM TẮT ĐƠN HÀNG (STICKY) */}
        <aside className="sticky top-24 h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-ink font-heading">Tóm tắt đơn hàng</h3>

          {/* Ô Nhập mã khuyến mãi */}
          <div className="mt-6">
            <label className="text-sm font-bold text-ink block mb-3">
              Nhập mã khuyến mãi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã..."
                className="w-full min-w-0 flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={handleApplyPromoCode}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 whitespace-nowrap"
              >
                Áp dụng
              </button>
            </div>
          </div>

          <hr className="my-5 border-dashed border-border" />

          {/* Chi tiết giá */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Đơn hàng</span>
              <strong>{formatCurrency(selectedTotalAmount)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Giảm</span>
              <strong>- {formatCurrency(discountAmount)}</strong>
            </div>
          </div>

          <hr className="my-5 border-dashed border-border" />

          {/* Tổng cộng */}
          <div className="flex items-center justify-between text-lg font-bold text-ink">
            <span>Tạm tính</span>
            <strong className="text-red-600 text-xl">{formatCurrency(finalTotal)}</strong>
          </div>

          {/* Nút thanh toán */}
          <div className="mt-6">
            <Link
              to={isAuthenticated && selectedItemIds.length > 0 ? ROUTES.CHECKOUT : ROUTES.LOGIN}
              className={`flex w-full items-center justify-center rounded-full px-5 py-3.5 text-center text-sm font-bold transition ${
                selectedItemIds.length > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Tiếp tục thanh toán
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default CartPage