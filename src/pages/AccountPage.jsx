import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveRoleValue } from '../constants'
import { useAuth } from '../contexts/AuthContext'
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
import { getAddressLabel } from '../utils/normalizers'

function AccountPage() {
  usePageTitle('Tài khoản - Synex')

  const { token, loadProfile, logout } = useAuth()

  // State quản lý tab đang hiển thị
  const [activeTab, setActiveTab] = useState('profile')

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
    const data = await getMyAddresses(token)
    setAddresses(Array.isArray(data) ? data : [])
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
    if (!profile?.createdAt) return null // Sửa thành null để ẩn khi không có dữ liệu
    const date = new Date(profile.createdAt)
    if (Number.isNaN(date.getTime())) return null // Sửa thành null để ẩn khi không có dữ liệu
    return date.toLocaleDateString('vi-VN')
  }, [profile])

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

  async function handleCreateAddress(event) {
    event.preventDefault()
    setMessage('')
    try {
      await createAddress(token, addressForm)
      await reloadAddresses()
      setAddressForm((prev) => ({
        ...prev,
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        district: '',
        city: '',
      }))
      setMessage('Đã thêm địa chỉ giao hàng')
    } catch (error) {
      setMessage(error.message || 'Thêm địa chỉ thất bại')
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
    setMessage('')
    try {
      await deleteAddress(token, addressId)
      await reloadAddresses()
      setMessage('Đã xóa địa chỉ')
    } catch (error) {
      setMessage(error.message || 'Xóa địa chỉ thất bại')
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
          {/* Card Info */}
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
              {/* Thêm điều kiện kiểm tra ở đây */}
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

          {/* Menu Điều Hướng */}
          <div className="overflow-hidden rounded-[28px] border border-border bg-white py-2 shadow-sm">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
                <p className="text-slate-700">
                  Cập nhật thông tin liên hệ để giao hàng và hỗ trợ nhanh hơn.
                </p>

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
                <p className="text-slate-700">
                  Khuyến nghị đặt mật khẩu tối thiểu 8 ký tự và bao gồm chữ + số.
                </p>

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

                <div className="overflow-x-auto rounded-2xl border border-border bg-white">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-slate-50">
                        <th className="whitespace-nowrap px-6 py-4 font-semibold text-ink">MÃ ĐƠN</th>
                        <th className="whitespace-nowrap px-6 py-4 font-semibold text-ink">NGÀY ĐẶT</th>
                        <th className="whitespace-nowrap px-6 py-4 font-semibold text-ink">TRẠNG THÁI</th>
                        <th className="whitespace-nowrap px-6 py-4 font-semibold text-ink">TỔNG TIỀN</th>
                        <th className="whitespace-nowrap px-6 py-4 font-semibold text-ink text-right">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">Chưa có đơn hàng nào.</td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id || order.orderCode} className="hover:bg-slate-50">
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink">
                              {order.orderCode || `ORD-${order.id}`}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                Chờ xác nhận
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink">
                              {order.total?.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <Link to={`/orders/${order.id}`} className="text-sky-700 font-semibold hover:underline">
                                Chi tiết →
                              </Link>
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

          {/* TAB: ĐỊA CHỈ */}
          {activeTab === 'addresses' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-ink">Địa chỉ nhận hàng</h2>
                <p className="mt-2 text-slate-700 mb-6">Quản lý địa chỉ giao hàng để đặt đơn nhanh hơn.</p>
              
                {addresses.length === 0 ? (
                  <p className="mt-4 text-slate-600">Chưa có địa chỉ nào được lưu.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <article key={address.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                        <p className="font-semibold text-ink">{address.fullName}</p>
                        <p className="mt-1 text-sm text-slate-700">{getAddressLabel(address)}</p>
                        <p className="mt-1 text-sm text-slate-700">{address.phoneNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {address.isDefault ? 'Mặc định' : 'Địa chỉ phụ'}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetDefault(address.id)}
                            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100"
                          >
                            Đặt mặc định
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-ink">Thêm địa chỉ mới</h2>
                <form className="mt-6 space-y-4" onSubmit={handleCreateAddress}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2" htmlFor="addressFullName">
                      <span className="text-sm font-medium text-ink">Họ tên người nhận</span>
                      <input
                        id="addressFullName"
                        value={addressForm.fullName}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        required
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </label>

                    <label className="block space-y-2" htmlFor="addressPhone">
                      <span className="text-sm font-medium text-ink">Số điện thoại</span>
                      <input
                        id="addressPhone"
                        value={addressForm.phoneNumber}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                        }
                        required
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2" htmlFor="addressLine">
                    <span className="text-sm font-medium text-ink">Địa chỉ cụ thể</span>
                    <input
                      id="addressLine"
                      value={addressForm.addressLine}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, addressLine: event.target.value }))
                      }
                      required
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2" htmlFor="district">
                      <span className="text-sm font-medium text-ink">Quận/Huyện</span>
                      <input
                        id="district"
                        value={addressForm.district}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, district: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </label>

                    <label className="block space-y-2" htmlFor="addressCity">
                      <span className="text-sm font-medium text-ink">Thành phố</span>
                      <input
                        id="addressCity"
                        value={addressForm.city}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, city: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Thêm địa chỉ
                  </button>
                </form>
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  )
}

export default AccountPage