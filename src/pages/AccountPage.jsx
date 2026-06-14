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

  const [activeTab, setActiveTab] = useState('profile')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [wishlist, setWishlist] = useState([])

  const [orderDetail, setOrderDetail] = useState(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)

  useEffect(() => {
    if (!selectedOrderId) {
      setOrderDetail(null)
      return
    }
    
    let active = true
    setIsLoadingOrder(true)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    
    fetch(`${API_URL}/api/orders/${selectedOrderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (active) {
        setOrderDetail(data)
        setIsLoadingOrder(false)
      }
    })
    .catch(err => {
      console.error("Lỗi lấy chi tiết đơn hàng:", err)
      if (active) setIsLoadingOrder(false)
    })

    return () => { active = false }
  }, [selectedOrderId, token])

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab)
      setSelectedOrderId(null)
    }
  }, [location])

  useEffect(() => {
    let active = true;
    const loadWishlist = async () => {
      if (!token) {
        const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(stored);
        return;
      }
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${API_URL}/api/wishlist/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && active) {
          const data = await res.json();
          setWishlist(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error("Lỗi tải wishlist:", err); }
    };

    loadWishlist();
    window.addEventListener('wishlistUpdated', loadWishlist);
    return () => {
      active = false;
      window.removeEventListener('wishlistUpdated', loadWishlist);
    };
  }, [token]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(100)
  const [profile, setProfile] = useState(null)
  
  const [profileForm, setProfileForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  // FIX: Thêm state cho dropdown form Account
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine: '',
    ward: '',
    city: '',
    country: 'Vietnam',
  })

  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (message) {
      setProgress(100)
      const animTimer = setTimeout(() => setProgress(0), 50)
      const closeTimer = setTimeout(() => setMessage(''), 3000)
      return () => {
        clearTimeout(animTimer)
        clearTimeout(closeTimer)
      }
    }
  }, [message])

  // FIX: Load Tỉnh/Thành TỪ API V2
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => console.error('Không tải được danh sách tỉnh/thành'))
  }, [])

  // FIX: Load Phường/Xã TỪ API V2
  useEffect(() => {
    if (!addressForm.city || provinces.length === 0) {
      setWards([])
      return
    }
    const prov = provinces.find(p => p.name === addressForm.city)
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
  }, [addressForm.city, provinces])

  const syncProfileForm = useCallback((nextProfile) => {
    if (!nextProfile) return
    setProfile(nextProfile)
    setProfileForm({
      username: nextProfile.username || '',
      fullName: nextProfile.fullName || nextProfile.name || '',
      email: nextProfile.email || '',
      phoneNumber: nextProfile.phoneNumber || nextProfile.phone || nextProfile.mobile || '',
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
        if (active) syncProfileForm(nextProfile)
      } catch (error) {
        if (active) setMessage(error.message || 'Không tải được thông tin tài khoản')
      }

      try {
        const addressData = await getMyAddresses(token)
        if (active) setAddresses(Array.isArray(addressData) ? addressData : [])
      } catch {
        if (active) setAddresses([])
      }

      try {
        const orderData = await getMyOrders(token)
        if (active) setOrders(Array.isArray(orderData) ? orderData : [])
      } catch {
        if (active) setOrders([])
      }
    }
    bootstrap()
    return () => { active = false }
  }, [token, loadProfile, syncProfileForm])

  const accountRole = useMemo(() => resolveRoleValue(profile), [profile])
  const profileInitial = useMemo(
    () => (profileForm.fullName || profileForm.username || profileForm.email || 'S').trim().charAt(0).toUpperCase(),
    [profileForm.fullName, profileForm.username, profileForm.email],
  )
  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return null
    const date = new Date(profile.createdAt)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('vi-VN')
  }, [profile])

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return orders.find(o => o.id === selectedOrderId || o.orderCode === selectedOrderId)
  }, [selectedOrderId, orders])

  const displayOrder = orderDetail || selectedOrder

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
        phone: profileForm.phoneNumber
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
    if (addresses.length >= 3) {
      setMessage('Chỉ được lưu tối đa 3 địa chỉ. Vui lòng chỉnh sửa hoặc xóa địa chỉ hiện có trước khi thêm mới.');
      return;
    }
    setEditingAddressId(null)
    setAddressForm({
      fullName: '',
      phoneNumber: '',
      addressLine: '',
      ward: '',
      city: '',
      country: 'Vietnam',
    })
    setIsAddressModalOpen(true)
  }

  const openEditAddressModal = (address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      fullName: address.fullName || '',
      // ĐÃ SỬA: Đọc thêm biến address.phone từ Backend trả về
      phoneNumber: address.phone || address.phoneNumber || '',
      addressLine: address.addressLine || address.street || '',
      ward: address.ward || '',
      city: address.province || address.city || '', 
      country: address.country || 'Vietnam',
    })
    setIsAddressModalOpen(true)
  }

  async function handleAddressFormSubmit(event) {
    event.preventDefault()
    setMessage('')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    
    const payload = {
      ...addressForm,
      street: addressForm.addressLine,
      district: '', 
      province: addressForm.city, // FIX: Gửi kèm key province
      phone: addressForm.phoneNumber
    }

    try {
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
        setMessage('Đã cập nhật thông tin địa chỉ thành công')
      } else {
        await createAddress(token, payload)
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
      if (addresses.length <= 1) {
        setMessage('Không thể xóa. Bạn phải giữ lại ít nhất 1 địa chỉ nhận hàng.');
        return;
      }
      if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) return
      setMessage('')
      try {
        await deleteAddress(token, addressId)
        await reloadAddresses()
        setMessage('Đã xóa địa chỉ thành công')
      } catch (error) {
        setMessage(error.message || 'Xóa địa chỉ thất bại')
      }
    }

    async function handleAddressFormSubmit(event) {
      event.preventDefault()
      setMessage('')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      
      // FIX LỖI MẶC ĐỊNH
      const activeAddr = addresses.find(a => a.id === editingAddressId);
      const isCurrentlyDefault = activeAddr ? (activeAddr.isDefault || activeAddr.default) : false;

      const payload = {
        ...addressForm,
        street: addressForm.addressLine,
        district: '', 
        province: addressForm.city, 
        phone: addressForm.phoneNumber,
        isDefault: isCurrentlyDefault,
        default: isCurrentlyDefault
      }

      try {
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
          setMessage('Đã cập nhật thông tin địa chỉ thành công')
        } else {
          await createAddress(token, payload)
          setMessage('Đã thêm địa chỉ giao hàng mới')
        }
        
        await reloadAddresses()
        setIsAddressModalOpen(false)
      } catch (error) {
        setMessage(error.message || 'Thao tác địa chỉ thất bại')
      }
    }

  async function handleRemoveFromWishlist(productId) {
    if (!window.confirm('Bạn có muốn bỏ yêu thích sản phẩm này?')) return
    setMessage('')
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const res = await fetch(`${API_URL}/api/wishlist/${productId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Không thể cập nhật danh sách yêu thích.')

      // Cập nhật LocalStorage để đồng bộ các component khác (như NavBar)
      const stored = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const filtered = stored.filter(item => getProductId(item) !== productId)
      localStorage.setItem('wishlist', JSON.stringify(filtered))
      
      // Bắn sự kiện để useEffect phía trên tự động load lại dữ liệu từ API
      window.dispatchEvent(new Event('wishlistUpdated'))
      setMessage('Đã bỏ yêu thích sản phẩm.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function handleCancelOrder(orderId) {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return
    setMessage('')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Hủy đơn hàng thất bại')

      setMessage('Đã hủy đơn hàng thành công')
      
      const orderData = await getMyOrders(token)
      setOrders(Array.isArray(orderData) ? orderData : [])
      setSelectedOrderId(null)
    } catch (error) {
      setMessage(error.message || 'Lỗi khi hủy đơn hàng')
    }
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

  const isSuccess = message.toLowerCase().includes('đã') || message.toLowerCase().includes('thành công')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      
      {message && (
        <div className="fixed top-8 left-1/2 z-[9999] flex min-w-[320px] -translate-x-1/2 items-center justify-between overflow-hidden rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
              {isSuccess ? (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <span className="text-xs font-bold">!</span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="ml-6 text-slate-400 hover:text-slate-600 transition">
            ✕
          </button>
          <div 
            className={`absolute bottom-0 left-0 h-1 transition-all duration-[3000ms] ease-linear ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        
        <aside className="w-full shrink-0 space-y-4 lg:w-[320px]">
          <div className="flex flex-col items-center rounded-[28px] border border-border bg-white p-6 shadow-sm">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
              {profileInitial}
            </div>
            
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink text-center">
              {profileForm.fullName || profileForm.username || 'Người dùng Synex'}
            </h2>
            <p className="mt-1 text-slate-700 text-center">
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

        <main className="flex-1 min-w-0">
          
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <form
                className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm"
                onSubmit={handleUpdateProfile}
              >
                <h2 className="text-2xl font-bold text-ink">Thông tin cá nhân</h2>
                <p className="text-slate-700">Cập nhật thông tin liên hệ để giao hàng và hỗ trợ nhanh hơn.</p>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <label className="block space-y-2" htmlFor="username">
                    <span className="text-sm font-medium text-ink">Tên đăng nhập</span>
                    <input
                      id="username"
                      value={profileForm.username}
                      disabled
                      title="Tên đăng nhập không thể thay đổi"
                      placeholder="Chưa có tên đăng nhập"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none text-slate-500 cursor-not-allowed"
                    />
                  </label>

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
                    onClick={() => setOrderStatusFilter('SHIPPING')}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      orderStatusFilter === 'SHIPPING' 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-white border border-border text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    Đang giao
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
                              ) : order.status === 'SHIPPING' ? (
                                <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 border border-sky-200">
                                  SHIPPING
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
                          
                          <div className="flex items-center gap-3 sm:w-auto">
                            <Link
                              to={`/products/${productId}`}
                              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm whitespace-nowrap"
                            >
                              Xem chi tiết
                            </Link>
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
                      
                      // Hiển thị chuẩn: Chi tiết - Phường/Xã - Tỉnh/Thành
                      const displayAddress = [address.street || address.addressLine, address.ward, address.province || address.city].filter(Boolean).join(' - ');

                      return (
                        <article key={address.id} className="relative rounded-2xl border border-border bg-slate-50 p-5">
                          
                          {isAddressDefault && (
                            <span className="absolute top-5 right-5 bg-red-50 text-red-600 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-sm uppercase shadow-sm border border-red-100">
                              Mặc định
                            </span>
                          )}

                          {/* Hiển thị Tên và SĐT trên cùng 1 dòng */}
                          <div className="flex items-center gap-4 mb-2">
                             <p className="font-bold text-ink text-base">{address.fullName}</p>
                             <p className="text-sm font-medium text-slate-600 border-l border-slate-300 pl-4">
                               {address.phoneNumber || address.phone}
                             </p>
                          </div>
                          
                          <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">{displayAddress}</p>

                          {/* ĐẢO VỊ TRÍ NÚT: Sửa - Xóa lên đầu, Đặt mặc định đẩy sang phải */}
                          <div className="mt-3 flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => openEditAddressModal(address)}
                              className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-red-600 transition"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Xóa
                            </button>

                            {/* Nút mặc định được đẩy dạt sang phải nhờ class "ml-auto" */}
                            <button
                              type="button"
                              onClick={() => handleSetDefault(address.id)}
                              disabled={isAddressDefault}
                              className={`ml-auto rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                                isAddressDefault 
                                  ? 'hidden' // Nếu đã là mặc định thì ẩn nút này đi cho gọn
                                  : 'bg-white text-sky-600 border-sky-200 hover:bg-sky-50'
                              }`}
                            >
                              Đặt mặc định
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

      {displayOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                  Chi tiết đơn hàng #{displayOrder.orderCode || displayOrder.id}
                  {isLoadingOrder && <span className="text-sm font-normal text-sky-600 animate-pulse">(Đang tải chi tiết...)</span>}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày đặt: {new Date(displayOrder.createdAt).toLocaleDateString('vi-VN')}
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
                    {displayOrder.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
                        COMPLETED
                      </span>
                    ) : displayOrder.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                        CANCELLED
                      </span>
                    ) : displayOrder.status === 'SHIPPING' ? (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-sky-100 text-sky-800 border-sky-200">
                        SHIPPING
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                        {displayOrder.status || 'PENDING'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-2">Phương thức thanh toán</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-slate-600 text-[20px]">
                      {displayOrder.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {displayOrder.paymentMethod === 'CARD' ? 'Thẻ tín dụng / Thẻ ghi nợ' : displayOrder.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </div>
                </div>

                {(() => {
                  let recName = 'Chưa cập nhật tên';
                  let recPhone = 'Chưa cập nhật SĐT';
                  let recAddress = 'Chưa cập nhật địa chỉ';

                  if (displayOrder.shippingAddress) {
                    const sa = displayOrder.shippingAddress;
                    recName = sa.fullName || sa.full_name || sa.name || recName;
                    recPhone = sa.phone || sa.phoneNumber || recPhone;
                    const parts = [sa.street || sa.addressLine, sa.ward, sa.province || sa.city].filter(Boolean);
                    if (parts.length > 0) {
                      recAddress = parts.join(', ');
                    } else if (sa.address) {
                      recAddress = sa.address;
                    }
                  } 
                  // SỬA TẠI ĐÂY: Khớp chính xác với tên biến API trả về (shippingFullName, shippingPhone, shippingStreet...)
                  else if (displayOrder.shippingFullName || displayOrder.fullName || displayOrder.receiverName) {
                    recName = displayOrder.shippingFullName || displayOrder.fullName || displayOrder.receiverName || recName;
                    recPhone = displayOrder.shippingPhone || displayOrder.phone || displayOrder.phoneNumber || recPhone;
                    
                    const parts = [
                      displayOrder.shippingStreet || displayOrder.street, 
                      displayOrder.shippingWard || displayOrder.ward, 
                      displayOrder.shippingProvince || displayOrder.province || displayOrder.city
                    ].filter(Boolean);
                    
                    if (parts.length > 0) {
                      recAddress = parts.join(', ');
                    } else if (displayOrder.address || displayOrder.shippingAddressStr) {
                      recAddress = displayOrder.address || displayOrder.shippingAddressStr;
                    }
                  }
                  else if (displayOrder.shippingAddressId) {
                    const matchAddr = addresses.find(a => a.id === displayOrder.shippingAddressId);
                    if (matchAddr) {
                      recName = matchAddr.fullName || matchAddr.full_name || matchAddr.name || recName;
                      recPhone = matchAddr.phone || matchAddr.phoneNumber || recPhone;
                      const parts = [matchAddr.street || matchAddr.addressLine, matchAddr.ward, matchAddr.province || matchAddr.city].filter(Boolean);
                      if (parts.length > 0) {
                        recAddress = parts.join(', ');
                      }
                    }
                  }

                  return (
                    <div className="rounded-2xl border border-border bg-slate-50 p-4 sm:col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                        Thông tin giao hàng
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
                  {(() => {
                    const orderItemsList = displayOrder.items || displayOrder.orderItems || [];
                    
                    return orderItemsList.length > 0 ? (
                      orderItemsList.map((item, idx) => {
                        const productName = item.productName || item.product?.name || item.name || 'Sản phẩm phụ kiện';
                        const productPrice = item.price || item.product?.price || 0;
                        const productImage = item.product?.image || item.product?.imageUrl || item.image;

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
                    )
                  })()}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Tổng thanh toán</span>
                <strong className="text-xl font-bold text-ink">
                  {(displayOrder.totalAmount ?? displayOrder.totalPrice ?? displayOrder.total ?? 0).toLocaleString('vi-VN')} đ
                </strong>
              </div>
              <div className="flex gap-3">
                {displayOrder.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(displayOrder.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 shadow-sm"
                  >
                    Hủy đơn hàng
                  </button>
                )}
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
        </div>
      )}

{/* MODAL THÊM / SỬA ĐỊA CHỈ TO RỘNG */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 bg-slate-50/50">
              <h3 className="text-2xl font-bold text-slate-900 font-heading">
                {editingAddressId ? 'Sửa địa chỉ giao hàng' : 'Thêm địa chỉ mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddressFormSubmit} className="p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Tên người nhận <span className="text-red-500">*</span></span>
                  <input
                    required
                    value={addressForm.fullName}
                    onChange={e => setAddressForm({...addressForm, fullName: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">SĐT người nhận <span className="text-red-500">*</span></span>
                  <input
                    required
                    value={addressForm.phoneNumber}
                    onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium text-ink"
                  />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 relative">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Tỉnh / Thành phố <span className="text-red-500">*</span></span>
                  <select
                    required
                    value={addressForm.city}
                    onChange={(e) => {
                      setAddressForm({...addressForm, city: e.target.value, ward: ''})
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
                    value={addressForm.ward}
                    onChange={e => setAddressForm({...addressForm, ward: e.target.value})}
                    disabled={!addressForm.city || wards.length === 0}
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
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Địa chỉ chi tiết (Số nhà, đường...) <span className="text-red-500">*</span></span>
                  <input
                    required
                    value={addressForm.addressLine}
                    onChange={e => setAddressForm({...addressForm, addressLine: e.target.value})}
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
    </div>
  )
}

export default AccountPage