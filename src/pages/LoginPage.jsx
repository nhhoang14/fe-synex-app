import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { ROUTES, resolveRoleValue, USER_ROLES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

function LoginPage() {
  usePageTitle('Đăng nhập - Synex')

  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const loginResponse = await login({
        email: form.email.trim(),
        password: form.password,
      })

      const normalizedRole = resolveRoleValue(loginResponse)

      // ĐÃ SỬA: Nếu là USER thông thường thì chuyển về trang chủ dashboard thay vì hồ sơ
      navigate(
        normalizedRole === USER_ROLES.ADMIN
          ? ROUTES.ADMIN
          : ROUTES.HOME || '/' // Sử dụng hằng số trang chủ của Synex (hoặc đường dẫn '/')
      )
    } catch (requestError) {
      setError(requestError.message || 'Đăng nhập thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="space-y-4 rounded-[28px] border border-border bg-white p-8 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h1 className="text-4xl font-bold tracking-tight text-ink">Đăng nhập</h1>

      <FormField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <FormField
        label="Mật khẩu"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <p className="text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link className="font-semibold text-sky-700 hover:underline" to={ROUTES.REGISTER}>
          Đăng ký ngay
        </Link>
      </p>
    </form>
  )
}

export default LoginPage