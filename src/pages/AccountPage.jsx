import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { resolveRoleValue } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  changeMyPassword,
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
  updateMyProfile,
} from '../services/userService'
import { getMyOrders } from '../services/orderService'
import {
  getAddressLabel,
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function AccountPage() {
  usePageTitle('Tài khoản - Synex')

  const { token, loadProfile, logout } = useAuth()
  const { addToCart } = useCart()
  const location = useLocation()

  // State quản lý tab đang hiển thị
  const [activeTab, setActiveTab] = useState('profile')
  
  // State quản lý đơn hàng đang xem chi tiết (Null nếu không xem đơn nào)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  // State quản lý bộ lọc trạng thái đơn hàng
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')

  // State lưu trữ danh sách sản phẩm đã thích
  const [wishlist, setWishlist] = useState([])

  // ĐÓN NHẬN TRẠNG THÁI TỪ FOOTER: Tự động chuyển tab khi bấm vào link "Đơn hàng của tôi"
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab)
      setSelectedOrderId(null) // Đóng modal chi tiết đơn hàng cũ nếu đang mở
    }
  }, [location])

  // LẮNG NGHE & TẢI DANH SÁCH YÊU THÍCH TỪ LOCAL STORAGE
  useEffect(() => {
    function loadWishlist() {
      const stored = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlist(stored)
    }
    
    loadWishlist()
    window.addEventListener('wishlistUpdated', loadWishlist)
    
    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlist)
    }
  }, [])

  // State quản lý Modal Địa chỉ (Thêm/Sửa)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)

  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine: '',
    district: '',
    city: '',
    country: 'Vietnam',
  })

  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])

  const syncProfileForm = useCallback((nextProfile) => {
    if (!nextProfile) return

    setProfile(nextProfile)

    setProfileForm({
      fullName: nextProfile.fullName || nextProfile.name || nextProfile.username || '',
      email: nextProfile.email || '',
      phoneNumber: nextProfile.phoneNumber || nextProfile.phone || '',
    })
  }, [])

  const reloadAddresses = useCallback(async () => {
    try {
      const data = await getMyAddresses(token)
      setAddresses(Array.isArray(data) ? data : [])
    } catch (err) {
      setAddresses([])
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    let active = true

    async function bootstrap() {
      try {
        const nextProfile = await loadProfile()
        if (!active) return
        syncProfileForm(nextProfile)
      } catch (error) {
        if (active) {
          setMessage(error.message || 'Không tải được thông tin tài khoản')
        }
      }

      try {
        const addressData = await getMyAddresses(token)
        if (!active) return
        setAddresses(Array.isArray(addressData) ? addressData : [])
      } catch {
        if (active) setAddresses([])
      }

      try {
        const orderData = await getMyOrders(token)
        if (!active) return
        setOrders(Array.isArray(orderData) ? orderData : [])
      } catch {
        if (active) setOrders([])
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [token, loadProfile, syncProfileForm])

  const accountRole = useMemo(() => resolveRoleValue(profile), [profile])
  const profileInitial = useMemo(
    () => (profileForm.fullName || profileForm.email || 'S').trim().charAt(0).toUpperCase(),
    [profileForm.fullName, profileForm.email],
  )
  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return null
    const date = new Date(profile.createdAt)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('vi-VN')
  }, [profile])

  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.isDefault || a.default) || addresses[0]
  }, [addresses])

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return orders.find(o => o.id === selectedOrderId || o.orderCode === selectedOrderId)
  }, [selectedOrderId, orders])

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'ALL') return orders;
    return orders.filter(order => order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  async function handleUpdateProfile(event) {
    event.preventDefault()
    setMessage('')
    try {
      await updateMyProfile(token, {
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
      })
      const nextProfile = await loadProfile()
      syncProfileForm(nextProfile)
      setMessage('Đã cập nhật thông tin cá nhân')
    } catch (error) {
      setMessage(error.message || 'Cập nhật thông tin thất bại')
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    setMessage('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }
    try {
      await changeMyPassword(token, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Đổi mật khẩu thành công')
    } catch (error) {
      setMessage(error.message || 'Đổi mật khẩu thất bại')
    }
  }

  const openCreateAddressModal = () => {
    setEditingAddressId(null)
    setAddressForm({
      fullName: '',
      phoneNumber: '',
      addressLine: '',
      district: '',
      city: '',
      country: 'Vietnam',
    })
    setIsAddressModalOpen(true)
  }

  const openEditAddressModal = (address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      fullName: address.fullName || '',
      phoneNumber: address.phoneNumber || '',
      addressLine: address.addressLine || '',
      district: address.district || '',
      city: address.city || '',
      country: address.country || 'Vietnam',
    })
    setIsAddressModalOpen(true)
  }

  async function handleAddressFormSubmit(event) {
    event.preventDefault()
    setMessage('')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    try {
      if (editingAddressId) {
        const response = await fetch(`${API_URL}/api/users/me/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressForm),
        })
        if (!response.ok) throw new Error('Cập nhật địa chỉ thất bại')
        setMessage('Đã cập nhật thông tin địa chỉ thành công')
      } else {
        await createAddress(token, addressForm)
        setMessage('Đã thêm địa chỉ giao hàng mới')
      }
      
      await reloadAddresses()
      setIsAddressModalOpen(false)
    } catch (error) {
      setMessage(error.message || 'Thao tác địa chỉ thất bại')
    }
  }

  async function handleSetDefault(addressId) {
    setMessage('')
    try {
      await setDefaultAddress(token, addressId)
      await reloadAddresses()
      setMessage('Đã cập nhật địa chỉ mặc định')
    } catch (error) {
      setMessage(error.message || 'Cập nhật địa chỉ mặc định thất bại')
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) return
    setMessage('')
    try {
      await deleteAddress(token, addressId)
      await reloadAddresses()
      setMessage('Đã xóa địa chỉ')
    } catch (error) {
      setMessage(error.message || 'Xóa địa chỉ thất bại')
    }
  }

  // CÁC HÀM XỬ LÝ SẢN PHẨM ĐÃ THÍCH
  function handleRemoveFromWishlist(productId) {
    const newWishlist = wishlist.filter((item) => getProductId(item) !== productId)
    localStorage.setItem('wishlist', JSON.stringify(newWishlist))
    setWishlist(newWishlist)
    window.dispatchEvent(new Event('wishlistUpdated'))
    setMessage('Đã bỏ thích sản phẩm.')
  }

  async function handleAddToCart(product) {
    const productId = getProductId(product)
    if (!productId) {
      setMessage('Không tìm thấy và xác định được mã ID sản phẩm.')
      return
    }
    try {
      await addToCart(productId, 1)
      setMessage(`Đã thêm ${getProductName(product)} vào giỏ hàng thành công!`)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const NAV_ITEMS = [
    {
      id: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'orders',
      label: 'Đơn hàng',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'wishlist',
      label: 'Sản phẩm đã thích',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'addresses',
      label: 'Địa chỉ',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {message && (
        <p className="mb-6 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          {message}
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        
        {/* === SIDEBAR MENU === */}
        <aside className="w-full shrink-0 space-y-4 lg:w-[320px]">
          <div className="flex flex-col items-center rounded-[28px] border border-border bg-white p-6 shadow-sm">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
              {profileInitial}
            </div>
            
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">
              {profileForm.fullName || 'Người dùng Synex'}
            </h2>
            <p className="mt-1 text-slate-700">
              {profileForm.email || 'Chưa cập nhật email'}
            </p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {memberSince && (
                <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  Từ {memberSince}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {accountRole}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-border bg-white py-2 shadow-sm">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSelectedOrderId(null)
                  }}
                  className={`flex w-full items-center justify-between px-6 py-4 text-base font-semibold transition-colors ${
                    activeTab === item.id 
                      ? 'bg-slate-50 text-ink' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.label}
                  </div>
                  {activeTab === item.id && (
                    <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                  )}
                </button>
              ))}
              
              <button 
                onClick={logout} 
                className="flex w-full items-center px-6 py-4 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 min-w-0">
          
          {/* TAB: HỒ SƠ */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <form
                className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm"
                onSubmit={handleUpdateProfile}
              >
                <h2 className="text-2xl font-bold text-ink">Thông tin cá nhân</h2>
                <p className="text-slate-700">Cập nhật thông tin liên hệ để giao hàng và hỗ trợ nhanh hơn.</p>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <label className="block space-y-2" htmlFor="fullName">
                    <span className="text-sm font-medium text-ink">Họ và tên</span>
                    <input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                      placeholder="Nhập họ và tên"
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>

                  <label className="block space-y-2" htmlFor="phoneNumber">
                    <span className="text-sm font-medium text-ink">Số điện thoại</span>
                    <input
                      id="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                      }
                      placeholder="Nhập số điện thoại"
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                </div>

                <label className="block space-y-2" htmlFor="email">
                  <span className="text-sm font-medium text-ink">Email</span>
                  <input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="Nhập email"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Lưu thông tin
                </button>
              </form>

              <form
                className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm"
                onSubmit={handleChangePassword}
              >
                <h2 className="text-2xl font-bold text-ink">Thay đổi mật khẩu</h2>
                <p className="text-slate-700">Khuyến nghị đặt mật khẩu tối thiểu 8 ký tự và bao gồm chữ + số.</p>

                <label className="block space-y-2 mt-4" htmlFor="oldPassword">
                  <span className="text-sm font-medium text-ink">Mật khẩu hiện tại</span>
                  <input
                    id="oldPassword"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
                    }
                    required
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2" htmlFor="newPassword">
                    <span className="text-sm font-medium text-ink">Mật khẩu mới</span>
                    <input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                      }
                      required
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>

                  <label className="block space-y-2" htmlFor="confirmPassword">
                    <span className="text-sm font-medium text-ink">Xác nhận mật khẩu mới</span>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                      }
                      required
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-4 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Cập nhật mật khẩu
                </button>
              </form>
            </div>
          )}

          {/* TAB: ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-300">
              <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-ink">Lịch sử đơn hàng</h2>
                <p className="mt-2 text-slate-700 mb-6">Theo dõi các đơn hàng gần đây và xem chi tiết.</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('ALL')}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      orderStatusFilter === 'ALL' 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-white border border-border text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('PENDING')}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      orderStatusFilter === 'PENDING' 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-white border border-border text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    Chờ xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('PROCESSING')}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      orderStatusFilter === 'PROCESSING' 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-white border border-border text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    Đang xử lý
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('COMPLETED')}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      orderStatusFilter === 'COMPLETED' 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-white border border-border text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    Hoàn thành
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('CANCELLED')}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      orderStatusFilter === 'CANCELLED' 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-white border border-border text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    Đã hủy
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border bg-white">
                  <table className="w-full text-left text-sm table-fixed min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border bg-slate-50">
                        <th className="w-[15%] whitespace-nowrap px-6 py-4 font-semibold text-ink">MÃ ĐƠN</th>
                        <th className="w-[20%] whitespace-nowrap px-6 py-4 font-semibold text-ink">NGÀY ĐẶT</th>
                        <th className="w-[25%] whitespace-nowrap px-6 py-4 font-semibold text-ink">TRẠNG THÁI</th>
                        <th className="w-[25%] whitespace-nowrap px-6 py-4 font-semibold text-ink">TỔNG TIỀN</th>
                        <th className="w-[15%] whitespace-nowrap px-6 py-4 font-semibold text-ink text-right">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                            {orders.length === 0 ? 'Chưa có đơn hàng nào.' : 'Không có đơn hàng nào khớp với trạng thái này.'}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id || order.orderCode} className="hover:bg-slate-50">
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink">
                              {order.orderCode || `ORD-${order.id}`}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {order.status === 'COMPLETED' ? (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
                                  COMPLETED
                                </span>
                              ) : order.status === 'CANCELLED' ? (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                                  CANCELLED
                                </span>
                              ) : order.status === 'PROCESSING' ? (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                                  PROCESSING
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                                  {order.status || 'PENDING'}
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink">
                              {(order.totalAmount ?? order.totalPrice ?? order.total ?? 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(order.id || order.orderCode)}
                                className="text-sky-700 font-semibold hover:underline"
                              >
                                Chi tiết →
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB MỚI (UPDATE: GIAO DIỆN DẠNG LIST): SẢN PHẨM ĐÃ THÍCH */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">Sản phẩm đã thích</h2>
                    <p className="mt-2 text-slate-700">Danh sách các sản phẩm bạn đã quan tâm và lưu lại.</p>
                  </div>
                </div>

                {wishlist.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-slate-50 p-8 text-center">
                    <p className="text-sm font-medium text-slate-500">Bạn chưa có sản phẩm yêu thích nào.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-white">
                    {wishlist.map((product, index) => {
                      const price = Number(getProductPrice(product)) || 0;
                      const productId = getProductId(product);
                      const productName = getProductName(product) || 'Sản phẩm chưa đặt tên';
                      const productImage = getProductImage(product);

                      return (
                        <div key={productId || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/50 transition gap-4">
                          
                          {/* Phía trái: Hình ảnh và Tên */}
                          <Link to={`/products/${productId}`} className="flex items-center gap-4 flex-1">
                            {productImage ? (
                              <img 
                                src={productImage} 
                                alt={productName} 
                                className="h-16 w-16 rounded-xl object-cover border border-border" 
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-xl bg-slate-100 border border-border flex items-center justify-center text-slate-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-ink text-base hover:text-sky-700 transition line-clamp-1">
                                {productName}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Đơn giá: <strong className="text-slate-900">{formatCurrency(price)}</strong>
                              </p>
                            </div>
                          </Link>
                          
                          {/* Phía phải: Các nút thao tác */}
                          <div className="flex items-center gap-3 sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm whitespace-nowrap"
                            >
                              Thêm vào giỏ
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveFromWishlist(productId);
                              }}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 whitespace-nowrap"
                            >
                              Xóa bỏ
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ĐỊA CHỈ */}
          {activeTab === 'addresses' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">Địa chỉ nhận hàng</h2>
                    <p className="mt-2 text-slate-700">Quản lý địa chỉ giao hàng để đặt đơn nhanh hơn.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateAddressModal}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>
              
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-slate-50 p-8 text-center">
                    <p className="text-sm font-medium text-slate-500">Chưa có địa chỉ nào được lưu.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => {
                      const isAddressDefault = address.isDefault === true || address.default === true;

                      return (
                        <article key={address.id} className="relative rounded-2xl border border-border bg-slate-50 p-4">
                          
                          {isAddressDefault && (
                            <span className="absolute top-4 right-4 bg-sky-100 text-sky-700 text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full border border-sky-200 uppercase shadow-xs">
                              Mặc định
                            </span>
                          )}

                          <p className="font-semibold text-ink">{address.fullName}</p>
                          <p className="mt-1 text-sm text-slate-700 pr-24">{getAddressLabel(address)}</p>
                          <p className="mt-1 text-sm text-slate-700">{address.phoneNumber}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetDefault(address.id)}
                              disabled={isAddressDefault}
                              className={`rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition ${
                                isAddressDefault 
                                  ? 'opacity-40 cursor-not-allowed pointer-events-none bg-slate-200 text-slate-400 border-slate-300' 
                                  : 'hover:bg-slate-100'
                              }`}
                            >
                              Đặt mặc định
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditAddressModal(address)}
                              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
                            >
                              Chỉnh sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Xóa bỏ
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          
        </main>
      </div>

      {/* === MODAL CHI TIẾT ĐƠN HÀNG === */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-ink">
                  Chi tiết đơn hàng #{selectedOrder.orderCode || selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white border border-border font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border p-4 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-2">Trạng thái đơn hàng</span>
                  <div className="mt-1.5">
                    {selectedOrder.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
                        COMPLETED
                      </span>
                    ) : selectedOrder.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                        CANCELLED
                      </span>
                    ) : selectedOrder.status === 'PROCESSING' ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                        PROCESSING
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                        {selectedOrder.status || 'PENDING'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-2">Phương thức thanh toán</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-slate-600 text-[20px]">
                      {selectedOrder.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {selectedOrder.paymentMethod === 'CARD' ? 'Thẻ tín dụng / Thẻ ghi nợ' : selectedOrder.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </div>
                </div>

                {(() => {
                  let recName = selectedOrder.receiverName || selectedOrder.fullName;
                  let recPhone = selectedOrder.receiverPhone || selectedOrder.phoneNumber || selectedOrder.phone;
                  let recAddress = typeof selectedOrder.address === 'string' ? selectedOrder.address : null;

                  if (selectedOrder.shippingAddress && typeof selectedOrder.shippingAddress === 'object') {
                    recName = recName || selectedOrder.shippingAddress.fullName;
                    recPhone = recPhone || selectedOrder.shippingAddress.phoneNumber;
                    recAddress = recAddress || getAddressLabel(selectedOrder.shippingAddress) || selectedOrder.shippingAddress.addressLine || selectedOrder.shippingAddress.detailAddress;
                  } else if (selectedOrder.address && typeof selectedOrder.address === 'object') {
                    recName = recName || selectedOrder.address.fullName;
                    recPhone = recPhone || selectedOrder.address.phoneNumber;
                    recAddress = recAddress || getAddressLabel(selectedOrder.address) || selectedOrder.address.addressLine || selectedOrder.address.detailAddress;
                  }

                  if ((!recName || !recAddress) && selectedOrder.shippingAddressId) {
                    const matchAddr = addresses.find(a => a.id === selectedOrder.shippingAddressId);
                    if (matchAddr) {
                      recName = recName || matchAddr.fullName;
                      recPhone = recPhone || matchAddr.phoneNumber;
                      recAddress = recAddress || getAddressLabel(matchAddr) || matchAddr.addressLine;
                    }
                  }

                  recName = recName || profile?.fullName || profile?.name || 'Chưa cập nhật tên';
                  recPhone = recPhone || profile?.phoneNumber || profile?.phone || 'Chưa cập nhật SĐT';
                  recAddress = recAddress || 'Chưa cập nhật địa chỉ';

                  return (
                    <div className="rounded-2xl border border-border bg-slate-50 p-4 sm:col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                        Thông tin người nhận
                      </span>
                      <div className="space-y-2 text-sm text-ink">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                          <span className="font-medium">{recName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                          <span className="text-slate-600">{recPhone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">location_on</span>
                          <span className="text-slate-600 leading-relaxed">{recAddress}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-3">
                  Danh sách phụ kiện
                </span>
                <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      const productName = item.productName || item.product?.name || item.name || 'Sản phẩm phụ kiện';
                      const productPrice = item.price || item.product?.price || 0;
                      const productImage = item.product?.image || item.image;

                      return (
                        <div key={item.id || idx} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            {productImage ? (
                              <img 
                                src={productImage} 
                                alt={productName} 
                                className="h-12 w-12 rounded-xl object-cover border border-border" 
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-slate-100 border border-border flex items-center justify-center text-slate-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-ink text-sm max-w-[350px] truncate">
                                {productName}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Số lượng: {item.quantity || 1} × {productPrice.toLocaleString('vi-VN')} đ
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-ink text-sm whitespace-nowrap">
                            {(productPrice * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="p-4 text-sm text-slate-500 text-center">
                      Không tìm thấy thông tin sản phẩm.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Tổng thanh toán</span>
                <strong className="text-xl font-bold text-ink">
                  {(selectedOrder.totalAmount ?? selectedOrder.totalPrice ?? selectedOrder.total ?? 0).toLocaleString('vi-VN')} đ
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-800 shadow-sm text-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL ĐA NĂNG: THÊM MỚI / SỬA THÔNG TIN ĐỊA CHỈ === */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-border bg-white shadow-xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-border bg-slate-50 px-6 py-4">
              <h3 className="text-xl font-bold text-ink">
                {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white border border-border font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddressFormSubmit} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2" htmlFor="addressFullName">
                  <span className="text-sm font-medium text-ink">Tên người nhận</span>
                  <input
                    id="addressFullName"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block space-y-2" htmlFor="addressPhoneNumber">
                  <span className="text-sm font-medium text-ink">Số điện thoại</span>
                  <input
                    id="addressPhoneNumber"
                    required
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm(p => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="0912345678"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2" htmlFor="addressCity">
                  <span className="text-sm font-medium text-ink">Tỉnh / Thành phố</span>
                  <input
                    id="addressCity"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="Hà Nội"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block space-y-2" htmlFor="addressDistrict">
                  <span className="text-sm font-medium text-ink">Quận / Huyện</span>
                  <input
                    id="addressDistrict"
                    required
                    value={addressForm.district}
                    onChange={(e) => setAddressForm(p => ({ ...p, district: e.target.value }))}
                    placeholder="Cầu Giấy"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </div>

              <label className="block space-y-2" htmlFor="addressLine">
                <span className="text-sm font-medium text-ink">Địa chỉ chi tiết (Số nhà, đường...)</span>
                <input
                  id="addressLine"
                  required
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm(p => ({ ...p, addressLine: e.target.value }))}
                  placeholder="Số 123 Đường Xuân Thủy"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <div className="border-t border-border pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}

export default AccountPage