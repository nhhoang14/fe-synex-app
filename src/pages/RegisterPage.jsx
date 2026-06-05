import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

// THÊM IMPORT: Gọi trực tiếp API để xử lý ngầm mà không làm thay đổi state chung
import { login as loginApi, extractToken } from '../services/authService'
import { updateMyProfile } from '../services/userService'

function RegisterPage() {
  usePageTitle('Đăng ký - Synex')

  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false) // Thêm loading để tránh bấm 2 lần

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. GỌI API ĐĂNG KÝ BÌNH THƯỜNG
      await register({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })

      // 2. THỦ THUẬT FRONTEND: Đăng nhập ngầm & Ép lưu số điện thoại
      // Vì Backend không lưu SĐT lúc đăng ký, ta tự động update nó ngay sau đó!
      try {
        const loginData = await loginApi({
          identifier: form.username.trim(), // Đăng nhập ngầm bằng username vừa tạo
          password: form.password
        })
        const tempToken = extractToken(loginData)
        
        if (tempToken) {
          await updateMyProfile(tempToken, {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            phoneNumber: form.phone.trim()
          })
        }
      } catch (silentError) {
        // Lỗi chạy ngầm thì cứ lờ đi, không làm sập luồng đăng ký của người dùng
        console.warn("Không thể đồng bộ SĐT ngầm:", silentError)
      }

      // 3. HOÀN TẤT & CHUYỂN TRANG
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
      
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 1500)
    } catch (requestError) {
      setError(requestError.message || 'Đăng ký thất bại')
      setIsSubmitting(false)
    }
  }

  return (
    <form 
      className="space-y-4 rounded-[28px] border border-border bg-white p-8 shadow-sm animate-in fade-in duration-300 sm:p-10" 
      onSubmit={handleSubmit}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading sm:text-3xl">Đăng ký tài khoản</h1>
      </div>

      <div className="space-y-4">
        {/* Tên đăng nhập */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px]">person</span>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Tên đăng nhập"
            required
            className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-4 text-sm font-medium text-ink placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Họ và tên */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px]">account_circle</span>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Họ và tên"
            required
            className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-4 text-sm font-medium text-ink placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Email */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px]">mail</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-4 text-sm font-medium text-ink placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Số điện thoại */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px]">call</span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại"
            required
            className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-4 text-sm font-medium text-ink placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Mật khẩu */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px]">lock</span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mật khẩu"
            required
            className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-12 text-sm font-medium text-ink placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 flex items-center text-slate-400 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px]">lock</span>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            required
            className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-12 text-sm font-medium text-ink placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 flex items-center text-slate-400 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showConfirmPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>
      </div>

      {/* Hiển thị thông báo */}
      {error && <p className="text-sm font-medium text-red-600 text-center mt-4">{error}</p>}
      {success && <p className="text-sm font-medium text-emerald-700 text-center mt-4">{success}</p>}

      {/* Nút Đăng ký */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </button>

      {/* Link Đăng nhập */}
      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Đã có tài khoản?{' '}
        <Link className="text-slate-900 font-bold hover:text-sky-700 hover:underline transition" to={ROUTES.LOGIN}>
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  )
}

export default RegisterPage