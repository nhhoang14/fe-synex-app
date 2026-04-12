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

  const { token, loadProfile } = useAuth()

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
      fullName: nextProfile.fullName || nextProfile.name || '',
      email: nextProfile.email || '',
      phoneNumber: nextProfile.phoneNumber || '',
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
        const profile = await loadProfile()
        if (!active) return
        syncProfileForm(profile)

        const [addressData, orderData] = await Promise.all([
          getMyAddresses(token),
          getMyOrders(token),
        ])

        if (!active) return
        setAddresses(Array.isArray(addressData) ? addressData : [])
        setOrders(Array.isArray(orderData) ? orderData : [])
      } catch (error) {
        if (active) {
          setMessage(error.message || 'Không tai được du lieu tai khoan')
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [token, loadProfile, syncProfileForm])

  const recentOrdersCount = useMemo(() => orders.slice(0, 5).length, [orders])
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault),
    [addresses],
  )
  const profileInitial = useMemo(
    () => (profileForm.fullName || 'S').trim().charAt(0).toUpperCase(),
    [profileForm.fullName],
  )
  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return 'Chưa cap nhat'
    const date = new Date(profile.createdAt)
    if (Number.isNaN(date.getTime())) return 'Chưa cap nhat'
    return date.toLocaleDateString('vi-VN')
  }, [profile])
  const accountRole = useMemo(
    () => resolveRoleValue(profile),
    [profile],
  )

  async function handleUpdateProfile(event) {
    event.preventDefault()

    try {
      await updateMyProfile(token, {
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
      })
      const profile = await loadProfile()
      syncProfileForm(profile)
      setMessage('Đã cập nhật thông tin cá nhân')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Mật khẩu moi va xac nhan mat khau khong khop')
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
      setMessage(error.message)
    }
  }

  async function handleCreateAddress(event) {
    event.preventDefault()

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
      setMessage(error.message)
    }
  }

  async function handleSetDefault(addressId) {
    try {
      await setDefaultAddress(token, addressId)
      await reloadAddresses()
      setMessage('Da cap nhat dia chi mặc định')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDeleteAddress(addressId) {
    try {
      await deleteAddress(token, addressId)
      await reloadAddresses()
      setMessage('Đã xóa địa chỉ')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="flex gap-5 rounded-[28px] border border-border bg-white p-8 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
            {profileInitial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">THONG TIN NGUOI DUNG</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">{profileForm.fullName || 'Người dùng Synex'}</h1>
            <p className="mt-2 text-slate-700">{profileForm.email || 'Cập nhật email de nhan thong bao don hang moi nhat.'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Thanh vien tu {memberSince}</span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{addresses.length} dia chi</span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{recentOrdersCount} don gan day</span>
            </div>
          </div>
        </article>

        <article className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
            <strong className="block text-3xl font-bold text-ink">{String(addresses.length).padStart(2, '0')}</strong>
            <span className="mt-2 block text-sm text-slate-600">Dia chi nhan hang</span>
          </div>
          <div className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
            <strong className="block text-3xl font-bold text-ink">{String(recentOrdersCount).padStart(2, '0')}</strong>
            <span className="mt-2 block text-sm text-slate-600">Don hang gan day</span>
          </div>
          <div className="rounded-3xl border border-slate-900 bg-slate-950 p-5 shadow-sm text-white">
            <strong className="block text-2xl font-bold">{accountRole}</strong>
            <span className="mt-2 block text-sm text-slate-300">Vai tro tai khoan</span>
          </div>
          <div className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
            <strong className="block text-3xl font-bold text-ink">{defaultAddress ? 'DAY DU' : 'CO BAN'}</strong>
            <span className="mt-2 block text-sm text-slate-600">Muc do ho so</span>
          </div>
        </article>
      </section>

      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}

      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <form className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm" onSubmit={handleUpdateProfile}>
            <h2 className="text-2xl font-bold text-ink">Thong tin ca nhan</h2>
            <p className="text-slate-700">Cập nhật thong tin lien he de giao hang va hỗ trợ nhanh hon.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2" htmlFor="fullName">
                <span className="text-sm font-medium text-ink">Ho va ten</span>
                <input
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Nhap ho va ten"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2" htmlFor="phoneNumber">
                <span className="text-sm font-medium text-ink">So dien thoai</span>
                <input
                  id="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  placeholder="Nhap so dien thoai"
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
                onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Nhap email"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
              Luu thong tin
            </button>
          </form>

          <form className="space-y-4 rounded-[28px] border border-border bg-white p-6 shadow-sm" onSubmit={handleChangePassword}>
            <h2 className="text-2xl font-bold text-ink">Thay đổi mật khẩu</h2>
            <p className="text-slate-700">Khuyến nghị đặt mật khẩu tối thiểu 8 ký tự và bao gồm chữ + số.</p>

            <label className="block space-y-2" htmlFor="oldPassword">
              <span className="text-sm font-medium text-ink">Mật khẩu hien tai</span>
              <input
                id="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
                required
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2" htmlFor="newPassword">
                <span className="text-sm font-medium text-ink">Mật khẩu moi</span>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
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
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  required
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>

            <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
              Cập nhật mat khau
            </button>
          </form>

        </div>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Dia chi nhan hang</h2>
            <p className="mt-2 text-slate-700">Quan ly dia chi giao hang de dat don nhanh hon.</p>

            {addresses.length === 0 ? (
              <p className="mt-4 text-slate-600">Chưa co dia chi nao tu backend.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <article key={address.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="font-semibold text-ink">{address.fullName}</p>
                    <p className="mt-1 text-sm text-slate-700">{getAddressLabel(address)}</p>
                    <p className="mt-1 text-sm text-slate-700">{address.phoneNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">{address.isDefault ? 'Mac dinh' : 'Dia chi phu'}</p>
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

            <form className="mt-6 space-y-4" onSubmit={handleCreateAddress}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2" htmlFor="addressFullName">
                  <span className="text-sm font-medium text-ink">Ho ten nguoi nhan</span>
                  <input
                    id="addressFullName"
                    value={addressForm.fullName}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    required
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
                <label className="block space-y-2" htmlFor="addressPhone">
                  <span className="text-sm font-medium text-ink">So dien thoai</span>
                  <input
                    id="addressPhone"
                    value={addressForm.phoneNumber}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                    required
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </div>

              <label className="block space-y-2" htmlFor="addressLine">
                <span className="text-sm font-medium text-ink">Dia chi cu the</span>
                <input
                  id="addressLine"
                  value={addressForm.addressLine}
                  onChange={(event) => setAddressForm((prev) => ({ ...prev, addressLine: event.target.value }))}
                  required
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2" htmlFor="district">
                  <span className="text-sm font-medium text-ink">Quan/Huyen</span>
                  <input
                    id="district"
                    value={addressForm.district}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, district: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
                <label className="block space-y-2" htmlFor="addressCity">
                  <span className="text-sm font-medium text-ink">Thành phố</span>
                  <input
                    id="addressCity"
                    value={addressForm.city}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </div>

              <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
                Thêm địa chỉ
              </button>
            </form>
          </section>

          <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Ho tro nhanh</h2>
            <p className="mt-2 text-slate-700">Can tro giup ve don hang, bao hanh hoac tư vấn thiet bi?</p>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/contact" className="rounded-full border border-border bg-white px-5 py-3 text-center font-semibold text-ink transition hover:bg-slate-50">
                Liên hệ ngay
              </Link>
              <Link to="/products" className="rounded-full border border-border bg-white px-5 py-3 text-center font-semibold text-ink transition hover:bg-slate-50">
                Xem them san pham
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}

export default AccountPage
