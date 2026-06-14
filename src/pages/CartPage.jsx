import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  normalizeImageUrl,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function CartPage() {
  usePageTitle('Giỏ hàng - Synex')

  const { isAuthenticated, token } = useAuth()
  const { items, fetchCart, increase, decrease, remove } = useCart()
  const navigate = useNavigate()
  
  const [message, setMessage] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [promoCode, setPromoCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)

  const allItemIds = useMemo(() => {
    return items.map(item => item.id).filter(Boolean)
  }, [items])

  const selectedTotalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const uniqueId = item.id

      if (selectedItemIds.includes(uniqueId)) {
        const quantity = getCartItemQuantity(item)
        const price = getProductPrice(item)
        return total + (price * quantity)
      }
      return total
    }, 0)
  }, [items, selectedItemIds])

  // Lấy số tiền giảm giá trực tiếp từ kết quả validate của API (VoucherValidationResponse)
  const discountAmount = useMemo(() => {
    // Chỉ tính giảm giá nếu voucher được server xác nhận là valid
    return (appliedVoucher && appliedVoucher.valid) ? Number(appliedVoucher.discountAmount || 0) : 0
  }, [appliedVoucher])

  const finalTotal = Math.max(0, selectedTotalAmount - discountAmount)

  // Tự động gọi API kiểm tra lại Voucher khi tổng tiền được chọn thay đổi
  useEffect(() => {
    const reValidateVoucher = async () => {
      // Chỉ thực hiện nếu đang có mã và có sản phẩm được chọn
      if (appliedVoucher?.code && selectedTotalAmount > 0) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
          const response = await fetch(
            `${API_URL}/api/vouchers/validate?code=${appliedVoucher.code}&orderAmount=${selectedTotalAmount}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (response.ok) {
            const result = await response.json()
            // Cập nhật kết quả mới (bao gồm trạng thái valid và số tiền giảm mới)
            setAppliedVoucher(result)
          } else {
            // Nếu Backend báo lỗi (ví dụ: đơn hàng không đủ giá tối thiểu), 
            // ta cập nhật voucher hiện tại thành không hợp lệ để UI hiển thị đúng
            setAppliedVoucher(prev => prev ? { 
              ...prev, 
              valid: false, 
              discountAmount: 0,
              message: "Đơn hàng không còn đủ điều kiện áp dụng mã này."
            } : null)
          }
        } catch (error) {
          console.error('Lỗi kiểm tra lại voucher:', error)
        }
      } else if (selectedTotalAmount === 0 && appliedVoucher) {
        // Nếu bỏ chọn tất cả sản phẩm thì gỡ bỏ voucher
        setAppliedVoucher(null)
        setPromoCode('')
      }
    }

    reValidateVoucher()
  }, [selectedTotalAmount, token, appliedVoucher?.code])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {
        setMessage('Không tải được giỏ hàng.')
      })
    }
  }, [isAuthenticated, fetchCart])

  function handleSelect(id) {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    )
  }

  function handleSelectAll() {
    if (selectedItemIds.length === allItemIds.length && allItemIds.length > 0) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(allItemIds)
    }
  }

  async function handleApplyPromoCode() {
    if (!promoCode.trim()) {
      alert('Vui lòng nhập mã khuyến mãi!')
      return
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/vouchers/validate?code=${promoCode.trim().toUpperCase()}&orderAmount=${selectedTotalAmount}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Mã giảm giá không hợp lệ hoặc không đủ điều kiện.')
      const voucher = await response.json()
      
      setAppliedVoucher(voucher)
      
      if (voucher.valid) {
        alert('Áp dụng mã khuyến mãi thành công!')
      }
    } catch (error) {
      setAppliedVoucher(null)
      alert(error.message)
    }
  }

  function handleRemovePromoCode() {
    setPromoCode('')
    setAppliedVoucher(null)
    alert('Đã bỏ áp dụng mã khuyến mãi.')
  }

  async function handleIncrease(cartItemId) {
    if (!isAuthenticated) return
    try {
      await increase(cartItemId, 1)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDecrease(cartItemId) {
    if (!isAuthenticated) return
    try {
      await decrease(cartItemId, 1)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleRemove(cartItemId) {
    if (!isAuthenticated) return
    try {
      await remove(cartItemId)
    } catch (error) {
      setMessage(error.message)
    }
  }

  // GỌI API KIỂM TRA TỒN KHO TRƯỚC KHI SANG TRANG CHECKOUT
  async function handleProceedToCheckout() {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }
    if (selectedItemIds.length === 0) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const res = await fetch(`${API_URL}/api/orders/validate-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // ĐÃ SỬA DÒNG NÀY: Bọc trong object có key cartItemIds
        body: JSON.stringify({ cartItemIds: selectedItemIds }) 
      })

      if (!res.ok) {
        throw new Error('Sản phẩm không đủ số lượng trong kho.')
      }

      // Đủ kho -> Điều hướng và mang theo mảng sản phẩm đã chọn
      navigate(ROUTES.CHECKOUT, { 
        state: { selectedItemIds, discountAmount, voucherCode: appliedVoucher?.code } 
      })
    } catch (error) {
      setMessage(error.message || 'Sản phẩm không đủ số lượng trong kho.')
    }
  }

  return (
    <div className="space-y-4">
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

          {message && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl">{message}</p>}

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
                        className="h-6 w-6 cursor-pointer rounded border-gray-300 text-slate-900 focus:ring-slate-900"
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
                    // Truy xuất thông tin Product (Catalog) thông qua variant trong CartItem
                    const product = getCartItemProduct(item)
                    
                    // Lấy productId chính xác của Catalog để làm Link chuyển trang
                    const productId = getProductId(product)
                    const productName = getProductName(product)
                    
                    const quantity = getCartItemQuantity(item)
                    const price = getProductPrice(item)
                    
                    // Ưu tiên hiển thị ảnh của riêng biến thể đó nếu có
                    const displayImage = item.variant?.imageUrl 
                      ? normalizeImageUrl(item.variant.imageUrl) 
                      : getProductImage(product)

                    const uniqueId = item.id

                    return (
                      <tr key={uniqueId} className="align-middle">
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            className="h-6 w-6 cursor-pointer rounded border-gray-300 text-slate-900 focus:ring-slate-900"
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
                              src={displayImage || getProductImage(product)}
                              alt={productName}
                              className="h-14 w-14 rounded-2xl object-cover shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span 
                                className="font-bold text-ink group-hover:text-sky-700 transition-colors line-clamp-2"
                                title={productName}
                              >
                                {productName}
                              </span>
                              {/* HIỂN THỊ CÁC THUỘC TÍNH ĐÃ CHỌN (VD: Màu sắc: Trắng / Dung lượng: 256GB) */}
                              {item.variant?.attributes && item.variant.attributes.length > 0 && (
                                <p className="mt-0.5 text-xs text-slate-500 font-medium italic">
                                  {item.variant.attributes.map(a => a.attributeValue).join(' / ')}
                                </p>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatCurrency(price)}</td>
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-2 py-2">
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center rounded-full bg-white font-semibold text-ink transition hover:bg-slate-100"
                              onClick={() => handleDecrease(uniqueId)}
                            >
                              -
                            </button>
                            <span className="min-w-8 text-center font-semibold text-ink">{quantity}</span>
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center rounded-full bg-white font-semibold text-ink transition hover:bg-slate-100"
                              onClick={() => handleIncrease(uniqueId)}
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
                              onClick={() => handleRemove(uniqueId)}
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

        <aside className="sticky top-24 h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-ink font-heading">Tóm tắt đơn hàng</h3>

          <div className="mt-6">
            {appliedVoucher ? (
              <div className={`rounded-xl border p-3 flex flex-col gap-1 transition-all ${
                appliedVoucher.valid 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-slate-300 bg-slate-100 grayscale'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-bold text-sm ${appliedVoucher.valid ? 'text-green-700' : 'text-slate-500'}`}>
                    Mã: {appliedVoucher.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePromoCode}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                  >
                    Bỏ áp dụng
                  </button>
                </div>
                
                {!appliedVoucher.valid && (
                  <p className="text-[11px] font-bold text-red-500 italic">
                    {appliedVoucher.message || 'Không đủ điều kiện áp dụng'}
                  </p>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <hr className="my-5 border-dashed border-border" />

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

          <div className="flex items-center justify-between text-lg font-bold text-ink">
            <span>Tạm tính</span>
            <strong className="text-red-600 text-xl">{formatCurrency(finalTotal)}</strong>
          </div>

          <div className="mt-6">
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedItemIds.length === 0}
              className={`flex w-full items-center justify-center rounded-full px-5 py-3.5 text-center text-sm font-bold transition ${
                selectedItemIds.length > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Tiếp tục thanh toán
            </button>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default CartPage