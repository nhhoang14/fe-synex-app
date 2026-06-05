import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

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
  
  // State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // State checkbox xác nhận
  const [isConfirmed, setIsConfirmed] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!isConfirmed) {
      setError('Vui lòng xác nhận các thông tin trên là chính xác.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      // Truyền thêm các trường mới vào hàm register
      await register({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
        password: form.password,
      })
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
      
      // Chuyển hướng sang trang đăng nhập sau khi tạo tài khoản thành công
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 1500)
    } catch (requestError) {
      setError(requestError.message || 'Đăng ký thất bại')
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
      {error && <p className="text-sm font-medium text-red-600 text-center">{error}</p>}
      {success && <p className="text-sm font-medium text-emerald-700 text-center">{success}</p>}

      {/* Nút Đăng ký */}
      <button 
        type="submit" 
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        Đăng ký
      </button>

      {/* Link Đăng nhập */}
      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Đã có tài khoản?{' '}
        <Link className="text-slate-900 font-bold hover:text-sky-700 hover:underline transition" to={ROUTES.LOGIN}>
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}

export default RegisterPage