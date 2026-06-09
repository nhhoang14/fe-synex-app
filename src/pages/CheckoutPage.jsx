import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import { PAYMENT_METHODS, ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { createOrder } from '../services/orderService'
import { getMyAddresses, createAddress, setDefaultAddress } from '../services/userService'
import {
  formatCurrency,
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
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('')

  // --- QUẢN LÝ THANH TOÁN QR ---
  const [qrOrder, setQrOrder] = useState(null) // Lưu thông tin đơn hàng để sinh QR {id, code, amount}
  const [timeLeft, setTimeLeft] = useState(1200) // 20 phút = 1200 giây
  const [qrFailed, setQrFailed] = useState(false) // Trạng thái khi hết giờ hoặc BE báo CANCEL
 
  // --- QUẢN LÝ MODAL ĐỊA CHỈ ---
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    city: '',
    ward: '',
    addressLine: ''
  })

  // API Hành chính
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])

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

        if (list.length > 0) {
          const defaultAddress = list.find((a) => a.isDefault || a.default) || list[0]
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id)
          }
        }
      })
      .catch(() => setAddresses([]))
  }, [fetchCart, token])

  // TẢI TỈNH / THÀNH PHỐ TỪ API V2
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => console.error('Không tải được danh sách tỉnh/thành'))
  }, [])

  // TỰ ĐỘNG TẢI PHƯỜNG / XÃ THUỘC TỈNH TỪ API V2
  useEffect(() => {
    if (!newAddress.city || provinces.length === 0) {
      setWards([])
      return
    }
    const prov = provinces.find(p => p.name === newAddress.city)
    if (prov) {
      fetch(`https://provinces.open-api.vn/api/v2/p/${prov.code}?depth=3`)
        .then(res => res.json())
        .then(data => {
          const allWards = []
          if (data.districts) {
            data.districts.forEach(d => {
              if (d.wards) allWards.push(...d.wards)
            })
          }
          setWards(allWards)
        })
        .catch(err => console.error(err))
    }
  }, [newAddress.city, provinces])
  // Đếm ngược thời gian QR (20 phút)
  useEffect(() => {
    let timer
    if (qrOrder && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [qrOrder, timeLeft])

  // Polling check trạng thái đơn hàng liên tục
  useEffect(() => {
    let interval
    if (qrOrder && timeLeft > 0) {
      interval = setInterval(async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
          const res = await fetch(`${API_URL}/api/orders/${qrOrder.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data = await res.json()
          
          // NẾU BE CHUYỂN TRẠNG THÁI THÀNH SHIPPING -> THÀNH CÔNG
          if (data.status === 'SHIPPING') {
            setQrOrder(null)
            setOrderSuccess(true)
            await fetchCart()
          } 
          // NẾU BE HỦY ĐƠN -> THẤT BẠI
          else if (data.status === 'CANCEL' || data.status === 'CANCELLED') {
            setQrOrder(null)
            setQrFailed(true)
          }
        } catch (error) {
          console.error("Lỗi khi check trạng thái:", error)
        }
      }, 3000) // Call API 3 giây 1 lần
    } else if (timeLeft === 0 && qrOrder) {
      // HẾT GIỜ -> THẤT BẠI
      setQrOrder(null)
      setQrFailed(true)
    }
    return () => clearInterval(interval)
  }, [qrOrder, timeLeft, token, fetchCart])

  const handleOpenAddModal = () => {
    if (addresses.length >= 3) {
      alert('Chỉ được lưu tối đa 3 địa chỉ. Vui lòng xóa bớt hoặc sửa địa chỉ hiện có trước khi thêm mới.');
      return;
    }
    setEditingAddressId(null)
    setNewAddress({ fullName: '', phoneNumber: '', city: '', ward: '', addressLine: '' })
    setIsAddressModalOpen(true)
  }

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr.id)
    setNewAddress({
      fullName: addr.fullName || '',
      phoneNumber: addr.phone || addr.phoneNumber || '',
      // FIX: Đọc cả 2 trường province và city để đảm bảo có dữ liệu gán vào Form
      city: addr.province || addr.city || '',
      ward: addr.ward || '',
      addressLine: addr.street || addr.addressLine || '' 
    })
    setIsAddressModalOpen(true)
  }

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(token, id);
      const updatedList = await getMyAddresses(token);
      setAddresses(updatedList);
      setSelectedAddressId(id);
    } catch (error) {
      alert('Không thể đặt địa chỉ mặc định: ' + error.message);
    }
  }

  const handleDeleteAddress = async (id) => {
      // THÊM CHẶN XÓA Ở ĐÂY
      if (addresses.length <= 1) {
        alert('Không thể xóa. Bạn phải giữ lại ít nhất 1 địa chỉ nhận hàng.');
        return;
      }
      if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        const response = await fetch(`${API_URL}/api/users/me/addresses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Xóa thất bại');
        
        const updatedList = await getMyAddresses(token);
        setAddresses(updatedList);
        if (selectedAddressId === id && updatedList.length > 0) {
          setSelectedAddressId(updatedList[0].id);
        } else if (updatedList.length === 0) {
          setSelectedAddressId('');
        }
      } catch (err) {
        alert('Lỗi khi xóa địa chỉ: ' + err.message);
      }
    }

    const handleSaveAddressModal = async (e) => {
      e.preventDefault()
      
      // FIX LỖI MẶC ĐỊNH: Lấy lại trạng thái isDefault cũ truyền lên BE
      const activeAddr = addresses.find(a => a.id === editingAddressId);
      const isCurrentlyDefault = activeAddr ? (activeAddr.isDefault || activeAddr.default) : false;

      const payload = {
        fullName: newAddress.fullName,
        phone: newAddress.phoneNumber, 
        phoneNumber: newAddress.phoneNumber, 
        street: newAddress.addressLine, 
        addressLine: newAddress.addressLine, 
        ward: newAddress.ward,
        district: '', 
        city: newAddress.city,
        province: newAddress.city, 
        country: 'Vietnam',
        isDefault: isCurrentlyDefault, // Ép truyền cờ này
        default: isCurrentlyDefault    // Ép truyền cờ này
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        
        if (editingAddressId) {
          const response = await fetch(`${API_URL}/api/users/me/addresses/${editingAddressId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })
          if (!response.ok) throw new Error('Cập nhật địa chỉ thất bại')
        } else {
          await createAddress(token, payload)
        }

        const updatedList = await getMyAddresses(token)
        setAddresses(updatedList)
        
        if (!editingAddressId && updatedList.length > 0) {
          setSelectedAddressId(updatedList[updatedList.length - 1].id)
        }
        setIsAddressModalOpen(false)
      } catch (err) {
        alert('Lỗi khi lưu địa chỉ: ' + err.message)
      }
    }

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

  const activeAddress = useMemo(() => {
    if (selectedAddressId) {
      return addresses.find(a => a.id === selectedAddressId) || null
    }
    return null
  }, [selectedAddressId, addresses])

  async function handleSubmitCheckout(event) {
    event.preventDefault()
    setMessage('')

    if (selectedItems.length === 0) {
      setMessage('Không có sản phẩm nào được chọn')
      return
    }

    if (!selectedAddressId) {
      setMessage('Vui lòng chọn địa chỉ giao hàng.')
      return
    }

    setPlacingOrder(true)

    try {
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
        note,
        shippingAddressId: Number(selectedAddressId) 
      }

      // GỌI API TẠO ĐƠN
      const response = await createOrder(token, payload)
      
      // KIỂM TRA PHƯƠNG THỨC THANH TOÁN 
      // (Lưu ý: Thay 'CARD' hoặc 'BANK' bằng đúng value bạn định nghĩa trong PAYMENT_METHODS)
      if (paymentMethod !== 'COD') {
        // Lấy mã đơn hàng BE trả về. Nếu BE trả về biến tên khác (như orderTrackingNumber), hãy đổi lại cho khớp.
        // Cần đảm bảo mã bắt đầu bằng "DH..." như yêu cầu.
        const returnedCode = response.orderCode || response.orderTrackingNumber || `DH${response.id}`
        
        setQrOrder({
          id: response.id,
          code: returnedCode,
          amount: finalTotal
        })
        setTimeLeft(1200) // Reset 20 phút
      } else {
        // LUỒNG THANH TOÁN KHI NHẬN HÀNG (COD)
        setOrderSuccess(true)
        await fetchCart()
      }
      // SỬA TẠI ĐÂY: Bật popup thay vì chỉ hiện dòng chữ
      setOrderSuccess(true)
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
        {/* FORM ĐẶT HÀNG CHÍNH */}
        <form
          className="space-y-6 rounded-[28px] border border-border bg-white p-6 shadow-sm sm:p-8 relative"
          onSubmit={handleSubmitCheckout}
        >
          <h2 className="text-2xl font-bold text-ink mb-2">Thông tin giao hàng</h2>

          <div className="space-y-5 animate-in fade-in duration-300">
            {activeAddress && (
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tên người nhận</span>
                  <p className="text-lg font-medium text-ink">{activeAddress.fullName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">SĐT người nhận</span>
                  <p className="text-lg font-medium text-ink">{activeAddress.phone || activeAddress.phoneNumber}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-slate-500 text-sm">Chưa có địa chỉ nào được lưu.</p>
              ) : (
                addresses.map((addr) => {
                  // FIX: Đọc province || city để hiển thị đầy đủ
                  const displayAddress = [addr.street || addr.addressLine, addr.ward, addr.province || addr.city].filter(Boolean).join(', ')

                  return (
                    <div key={addr.id} className={`rounded-2xl border p-4 transition-all ${selectedAddressId === addr.id ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-sky-300'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
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
                          <p className="text-sm text-slate-600 leading-relaxed mb-1">
                            {addr.phone || addr.phoneNumber}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {displayAddress}
                          </p>
                        </div>
                      </label>

                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-4 pl-7">
                        {!(addr.isDefault || addr.default) && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleSetDefault(addr.id) }}
                            className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
                          >
                            Đặt mặc định
                          </button>
                        )}
                        
                        <div className="flex items-center gap-3 ml-auto">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleOpenEditModal(addr) }}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleDeleteAddress(addr.id) }}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="pt-2 flex items-center gap-2 text-sm font-medium">
              <span className="text-slate-700">hoặc</span>
              <button 
                type="button" 
                onClick={handleOpenAddModal} 
                className="text-red-600 hover:text-red-700 hover:underline transition font-bold"
              >
                nhập địa chỉ mới
              </button>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú khác (nếu có)"
              className="w-full border-b border-slate-300 bg-transparent px-2 py-2 outline-none transition focus:border-sky-500 font-medium text-ink placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4">
            <label className="block space-y-2 relative">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phương thức thanh toán</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 font-medium text-ink appearance-none cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-[36px] text-slate-500 pointer-events-none">expand_more</span>
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

        {/* CỘT TỔNG TIỀN BÊN PHẢI */}
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

      {/* MODAL NHẬP ĐỊA CHỈ NỔI LÊN (POPUP) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <h3 className="text-2xl font-bold text-slate-900 font-heading">
                {editingAddressId ? 'Sửa địa chỉ giao hàng' : 'Thêm địa chỉ mới'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddressModal} className="p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Tên người nhận <span className="text-red-500">*</span></span>
                  <input
                    required
                    value={newAddress.fullName}
                    onChange={e => setNewAddress({...newAddress, fullName: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">SĐT người nhận <span className="text-red-500">*</span></span>
                  <input
                    required
                    value={newAddress.phoneNumber}
                    onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink"
                  />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 relative">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Tỉnh / Thành phố <span className="text-red-500">*</span></span>
                  <select
                    required
                    value={newAddress.city}
                    onChange={(e) => {
                      setNewAddress({...newAddress, city: e.target.value, ward: ''})
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden></option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-[40px] text-slate-400 pointer-events-none">expand_more</span>
                </label>

                <label className="block space-y-2 relative">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Phường / Xã <span className="text-red-500">*</span></span>
                  <select
                    required={wards.length > 0}
                    value={newAddress.ward}
                    onChange={e => setNewAddress({...newAddress, ward: e.target.value})}
                    disabled={!newAddress.city || wards.length === 0}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled hidden></option>
                    {wards.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-[40px] text-slate-400 pointer-events-none">expand_more</span>
                </label>
              </div>

              <div className="pt-2">
                <label className="block space-y-2">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Số nhà, Đường <span className="text-red-500">*</span></span>
                  <input
                    required
                    value={newAddress.addressLine}
                    onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink"
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition shadow-sm"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP ĐẶT HÀNG THÀNH CÔNG ĐƯỢC CHÈN VÀO ĐÂY */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-200 p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900">Đặt hàng thành công!</h3>
            <p className="mb-8 text-sm text-slate-600 leading-relaxed">
              Cảm ơn bạn đã mua sắm tại Synex. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Tiếp tục mua sắm
              </button>
              <button
                type="button"
                onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
                className="flex-1 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition shadow-sm"
              >
                Xem đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL QR THANH TOÁN */}
      {qrOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl p-8 text-center relative">
            <h3 className="mb-2 text-2xl font-bold text-slate-900">Quét mã thanh toán</h3>
            <p className="text-sm text-slate-500 mb-6">Sử dụng App ngân hàng để quét mã. Đơn hàng sẽ tự động duyệt khi thanh toán thành công.</p>
            
            {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2">
              <span className="material-symbols-outlined text-red-500 text-lg">timer</span>
              <span className="font-bold text-red-600 text-lg tracking-widest">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>

            {/* MÃ VIETQR DYNAMIC */}
            <div className="mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 w-fit">
              <img 
                src={`https://img.vietqr.io/image/mb-1166661403-compact2.png?amount=${qrOrder.amount}&addInfo=${qrOrder.code}&accountName=SYNEX`} 
                alt="QR Code Thanh Toán" 
                className="w-64 h-64 object-contain rounded-xl"
              />
            </div>

            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
              <p className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-500">Ngân hàng:</span> 
                <span className="font-bold text-ink">MB Bank</span>
              </p>
              <p className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-500">Số tài khoản:</span> 
                <span className="font-bold text-ink">1166661403</span>
              </p>
              <p className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-500">Số tiền:</span> 
                <span className="font-bold text-red-600">{formatCurrency(qrOrder.amount)}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-slate-500">Nội dung CK:</span> 
                <span className="font-bold text-sky-600">{qrOrder.code}</span>
              </p>
            </div>
            
            <p className="mt-4 text-[13px] text-slate-400 italic animate-pulse">Hệ thống đang chờ xác nhận thanh toán...</p>
          </div>
        </div>
      )}

      {/* MODAL THANH TOÁN THẤT BẠI / QUÁ HẠN */}
      {qrFailed && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined text-[40px] text-red-600">error</span>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900">Thanh toán thất bại</h3>
            <p className="mb-8 text-sm text-slate-600 leading-relaxed">
              Đơn hàng đã quá thời gian thanh toán hoặc đã bị hủy. Vui lòng đặt lại đơn hàng mới.
            </p>
            <button
              onClick={() => {
                setQrFailed(false)
                navigate(ROUTES.CART)
              }}
              className="w-full rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white hover:bg-slate-800 transition shadow-sm"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default CheckoutPage