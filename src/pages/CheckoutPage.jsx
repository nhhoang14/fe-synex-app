import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import { PAYMENT_METHODS, ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { createOrder } from '../services/orderService'
import { getMyAddresses, createAddress } from '../services/userService'
import {
  formatCurrency,
  getAddressLabel,
  getCartItemProduct,
  getCartItemQuantity,
  getProductName,
  getProductPrice,
  getProductId,
} from '../utils/normalizers'

function CheckoutPage() {
  usePageTitle('Thanh toán - Synex')

  const { token } = useAuth()
  const { items, fetchCart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const selectedItemIds = location.state?.selectedItemIds || []
  const discountAmount = location.state?.discountAmount || 0

  const [addresses, setAddresses] = useState([])
  const [message, setMessage] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  
  // Quản lý hiển thị Form hay List
  const [viewMode, setViewMode] = useState('list')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)

  // Form địa chỉ mới
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    city: '',
    district: '',
    ward: '',
    addressLine: ''
  })
  
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value)

  useEffect(() => {
    if (selectedItemIds.length === 0) {
      navigate(ROUTES.CART)
    }
  }, [selectedItemIds, navigate])

  useEffect(() => {
    fetchCart().catch(() => {
      setMessage('Không tải được giỏ hàng')
    })

    getMyAddresses(token)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setAddresses(list)

        if (list.length === 0) {
          setViewMode('form')
        } else {
          setViewMode('list')
          const defaultAddress = list.find((a) => a.isDefault || a.default) || list[0]
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id)
          }
        }
      })
      .catch(() => {
        setAddresses([])
        setViewMode('form')
      })
  }, [fetchCart, token])

  const selectedItems = useMemo(() => {
    return items.filter((item) => {
      const product = getCartItemProduct(item)
      const uniqueId = item.id || getProductId(product)
      return selectedItemIds.includes(uniqueId)
    })
  }, [items, selectedItemIds])

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const product = getCartItemProduct(item)
      return sum + getCartItemQuantity(item) * getProductPrice(product)
    }, 0)
  }, [selectedItems])

  const finalTotal = Math.max(0, subtotal - discountAmount)

  // Lấy ra thông tin địa chỉ đang được chọn để hiển thị ở Top
  const activeAddress = useMemo(() => {
    if (viewMode === 'list' && selectedAddressId) {
      return addresses.find(a => a.id === selectedAddressId) || null
    }
    return null
  }, [viewMode, selectedAddressId, addresses])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (selectedItems.length === 0) {
      setMessage('Không có sản phẩm nào được chọn')
      return
    }

    setPlacingOrder(true)
    let finalShippingAddressId = selectedAddressId

    try {
      if (viewMode === 'form') {
        if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.addressLine || !newAddress.city) {
          throw new Error('Vui lòng điền đầy đủ thông tin nhận hàng.')
        }

        if (saveAddress && addresses.length < 3) {
          const fullAddressString = `${newAddress.addressLine}, ${newAddress.ward ? newAddress.ward + ', ' : ''}${newAddress.district}, ${newAddress.city}`
          await createAddress(token, { 
            fullName: newAddress.fullName,
            phoneNumber: newAddress.phoneNumber,
            addressLine: fullAddressString,
            city: newAddress.city,
            district: newAddress.district,
            country: 'Vietnam' 
          })
          const updatedList = await getMyAddresses(token)
          const created = updatedList[updatedList.length - 1]
          if (created) finalShippingAddressId = created.id
        }
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      
      const validateRes = await fetch(`${API_URL}/api/orders/validate-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cartItemIds: selectedItemIds })
      })

      if (!validateRes.ok) {
        setMessage('Sản phẩm không đủ số lượng trong kho. Đang quay lại giỏ hàng...')
        setTimeout(() => { navigate(ROUTES.CART) }, 2000)
        return
      }

      const payload = {
        paymentMethod,
        cartItemIds: selectedItemIds,
        discountAmount,
        note
      }

      if (viewMode === 'list' || (viewMode === 'form' && saveAddress)) {
        payload.shippingAddressId = Number(finalShippingAddressId)
      } else {
        payload.fullName = newAddress.fullName
        payload.phoneNumber = newAddress.phoneNumber
        payload.address = `${newAddress.addressLine}, ${newAddress.ward ? newAddress.ward + ', ' : ''}${newAddress.district}, ${newAddress.city}`
      }

      await createOrder(token, payload)
      setMessage('Đặt đơn thành công!')
      await fetchCart()
      
    } catch (error) {
      setMessage(error.message || 'Đặt đơn thất bại. Vui lòng thử lại.')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageBanner
        title="Trang thanh toán"
        subtitle="Xác nhận thông tin và đặt đơn hàng."
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form
          className="space-y-6 rounded-[28px] border border-border bg-white p-6 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-ink mb-2">Thông tin giao hàng</h2>

          {viewMode === 'list' ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {activeAddress && (
                <div className="grid grid-cols-2 gap-4 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tên người nhận</span>
                    <p className="text-lg font-medium text-ink">{activeAddress.fullName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">SĐT người nhận</span>
                    <p className="text-lg font-medium text-ink">{activeAddress.phoneNumber}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label 
                    key={addr.id} 
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="pt-1 flex-shrink-0">
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddressId === addr.id} 
                        onChange={() => setSelectedAddressId(addr.id)} 
                        className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 transition" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-ink">{addr.fullName || 'Tên người nhận'}</span>
                        {(addr.isDefault || addr.default) && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wide">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {getAddressLabel(addr)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {addresses.length < 3 && (
                <div className="pt-2 flex items-center gap-2 text-sm font-medium">
                  <span className="text-slate-700">hoặc</span>
                  <button 
                    type="button" 
                    onClick={() => setViewMode('form')} 
                    className="text-red-600 hover:text-red-700 hover:underline transition font-bold"
                  >
                    nhập địa chỉ mới
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid gap-4 md:grid-cols-2 pb-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên người nhận</span>
                  <input
                    required
                    value={newAddress.fullName}
                    onChange={e => setNewAddress({...newAddress, fullName: e.target.value})}
                    className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink text-lg"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SĐT người nhận</span>
                  <input
                    required
                    value={newAddress.phoneNumber}
                    onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                    className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink text-lg"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3 pt-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỉnh / Thành phố</span>
                  <input
                    required
                    value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quận / Huyện</span>
                  <input
                    required
                    value={newAddress.district}
                    onChange={e => setNewAddress({...newAddress, district: e.target.value})}
                    className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phường / Xã</span>
                  <input
                    value={newAddress.ward}
                    onChange={e => setNewAddress({...newAddress, ward: e.target.value})}
                    className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink"
                  />
                </label>
              </div>

              <div className="pt-2">
                <input
                  required
                  value={newAddress.addressLine}
                  onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})}
                  placeholder="Số nhà, tên đường (Vui lòng điền chi tiết)"
                  className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={saveAddress} 
                    onChange={e => setSaveAddress(e.target.checked)} 
                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 transition" 
                  />
                  <span className="text-sm font-semibold text-sky-600 group-hover:text-sky-700 transition">
                    Lưu địa chỉ cho lần mua kế tiếp
                  </span>
                </label>

                {addresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setViewMode('list')} 
                    className="text-sm font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
                  >
                    Chọn từ sổ địa chỉ
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 mt-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú khác (nếu có)"
              className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phương thức thanh toán</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 font-medium text-ink"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={placingOrder || selectedItems.length === 0}
            className="w-full rounded-full bg-slate-900 px-5 py-4 font-bold uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {placingOrder ? 'Đang kiểm tra & Đặt đơn...' : 'Đặt đơn hàng'}
          </button>

          {message && (
            <p className={`rounded-2xl px-4 py-3 text-sm font-medium text-center ${message.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </p>
          )}
        </form>

        <aside className="h-fit rounded-[28px] border border-border bg-white p-6 shadow-sm sticky top-24">
          <h3 className="text-2xl font-bold text-ink font-heading">Chi tiết đơn hàng</h3>

          <div className="mt-4 space-y-3">
            {selectedItems.length === 0 ? (
              <p className="text-slate-600">Không có sản phẩm nào được chọn.</p>
            ) : (
              selectedItems.map((item) => {
                const product = getCartItemProduct(item)
                const quantity = getCartItemQuantity(item)
                const price = getProductPrice(product)

                return (
                  <div
                    key={item.id || `${getProductName(product)}-${quantity}`}
                    className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    <p className="font-semibold text-ink line-clamp-2">{getProductName(product)}</p>
                    <p className="mt-1">
                      Số lượng: {quantity} × {formatCurrency(price)}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      Thành tiền: {formatCurrency(price * quantity)}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          <hr className="my-5 border-dashed border-border" />

          <div className="space-y-3 text-slate-700 font-medium">
            <p className="flex items-center justify-between">
              <span>Đơn hàng</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </p>
            
            {discountAmount > 0 && (
              <p className="flex items-center justify-between text-sky-600">
                <span>Giảm giá</span>
                <strong>- {formatCurrency(discountAmount)}</strong>
              </p>
            )}
          </div>

          <hr className="my-5 border-dashed border-border" />

          <p className="flex items-center justify-between text-lg font-bold text-ink uppercase">
            <span>Tổng cộng</span>
            <strong className="text-red-600 text-xl">{formatCurrency(finalTotal)}</strong>
          </p>
        </aside>
      </section>
    </div>
  )
}

export default CheckoutPage