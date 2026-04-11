import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
    () =>
      String(profile?.role || profile?.userRole || 'USER')
        .replace('ROLE_', '')
        .toUpperCase(),
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
    <div className="account-page-shell">
      <section className="account-hero-grid">
        <article className="account-hero-main">
          <div className="account-avatar">{profileInitial}</div>
          <div className="account-hero-content">
            <p className="account-overline">THONG TIN NGUOI DUNG</p>
            <h1>{profileForm.fullName || 'Người dùng Synex'}</h1>
            <p>{profileForm.email || 'Cập nhật email de nhan thong bao don hang moi nhat.'}</p>
            <div className="account-pill-row">
              <span className="account-pill">Thanh vien tu {memberSince}</span>
              <span className="account-pill">{addresses.length} dia chi</span>
              <span className="account-pill">{recentOrdersCount} don gan day</span>
            </div>
          </div>
        </article>

        <article className="account-stats-grid">
          <div className="account-stat-card">
            <strong>{String(addresses.length).padStart(2, '0')}</strong>
            <span>Dia chi nhan hang</span>
          </div>
          <div className="account-stat-card">
            <strong>{String(recentOrdersCount).padStart(2, '0')}</strong>
            <span>Don hang gan day</span>
          </div>
          <div className="account-stat-card dark">
            <strong>{accountRole}</strong>
            <span>Vai tro tai khoan</span>
          </div>
          <div className="account-stat-card">
            <strong>{defaultAddress ? 'DAY DU' : 'CO BAN'}</strong>
            <span>Muc do ho so</span>
          </div>
        </article>
      </section>

      {message && <p className="hint account-message">{message}</p>}

      <section className="account-content-grid">
        <div className="account-left-column">
          <form className="account-card" onSubmit={handleUpdateProfile}>
            <h2>Thong tin ca nhan</h2>
            <p>Cập nhật thong tin lien he de giao hang va hỗ trợ nhanh hon.</p>

            <div className="form-row-2">
              <label className="form-field" htmlFor="fullName">
                <span>Ho va ten</span>
                <input
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  placeholder="Nhap ho va ten"
                />
              </label>

              <label className="form-field" htmlFor="phoneNumber">
                <span>So dien thoai</span>
                <input
                  id="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                  }
                  placeholder="Nhap so dien thoai"
                />
              </label>
            </div>

            <label className="form-field" htmlFor="email">
              <span>Email</span>
              <input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Nhap email"
              />
            </label>

            <button type="submit" className="account-action-btn">
              Luu thong tin
            </button>
          </form>

          <form className="account-card" onSubmit={handleChangePassword}>
            <h2>Thay đổi mật khẩu</h2>
            <p>Khuyến nghị đặt mật khẩu tối thiểu 8 ký tự và bao gồm chữ + số.</p>

            <label className="form-field" htmlFor="oldPassword">
              <span>Mật khẩu hien tai</span>
              <input
                id="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
                }
                required
              />
            </label>

            <div className="form-row-2">
              <label className="form-field" htmlFor="newPassword">
                <span>Mật khẩu moi</span>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="form-field" htmlFor="confirmPassword">
                <span>Xác nhận mật khẩu mới</span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <button type="submit" className="account-action-btn">
              Cập nhật mat khau
            </button>
          </form>
        </div>

        <aside className="account-right-column">
          <section className="account-card">
            <h2>Dia chi nhan hang</h2>
            <p>Quan ly dia chi giao hang de dat don nhanh hon.</p>

            {addresses.length === 0 ? (
              <p>Chưa co dia chi nao tu backend.</p>
            ) : (
              <div className="address-grid">
                {addresses.map((address) => (
                  <article key={address.id} className="address-card">
                    <p>
                      <strong>{address.fullName}</strong>
                    </p>
                    <p>{getAddressLabel(address)}</p>
                    <p>{address.phoneNumber}</p>
                    <p>{address.isDefault ? 'Mac dinh' : 'Dia chi phu'}</p>
                    <div className="row">
                      <button type="button" onClick={() => handleSetDefault(address.id)}>
                        Đặt mặc định
                      </button>
                      <button type="button" onClick={() => handleDeleteAddress(address.id)}>
                        Xóa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <form className="account-address-form" onSubmit={handleCreateAddress}>
              <div className="form-row-2">
                <label className="form-field" htmlFor="addressFullName">
                  <span>Ho ten nguoi nhan</span>
                  <input
                    id="addressFullName"
                    value={addressForm.fullName}
                    onChange={(event) =>
                      setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="form-field" htmlFor="addressPhone">
                  <span>So dien thoai</span>
                  <input
                    id="addressPhone"
                    value={addressForm.phoneNumber}
                    onChange={(event) =>
                      setAddressForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <label className="form-field" htmlFor="addressLine">
                <span>Dia chi cu the</span>
                <input
                  id="addressLine"
                  value={addressForm.addressLine}
                  onChange={(event) =>
                    setAddressForm((prev) => ({ ...prev, addressLine: event.target.value }))
                  }
                  required
                />
              </label>

              <div className="form-row-2">
                <label className="form-field" htmlFor="district">
                  <span>Quan/Huyen</span>
                  <input
                    id="district"
                    value={addressForm.district}
                    onChange={(event) =>
                      setAddressForm((prev) => ({ ...prev, district: event.target.value }))
                    }
                  />
                </label>
                <label className="form-field" htmlFor="addressCity">
                  <span>Thành phố</span>
                  <input
                    id="addressCity"
                    value={addressForm.city}
                    onChange={(event) =>
                      setAddressForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </label>
              </div>

              <button type="submit" className="account-action-btn">
                Thêm địa chỉ
              </button>
            </form>
          </section>

          <section className="account-card">
            <h2>Ho tro nhanh</h2>
            <p>Can tro giup ve don hang, bao hanh hoac tư vấn thiet bi?</p>
            <Link to="/contact" className="ghost-link account-link-btn">
              Liên hệ ngay
            </Link>
            <Link to="/products" className="ghost-link account-link-btn">
              Xem them san pham
            </Link>
          </section>
        </aside>
      </section>
    </div>
  )
}

export default AccountPage
