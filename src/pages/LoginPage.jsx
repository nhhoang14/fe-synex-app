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
  
  const [form, setForm] = useState({ identifier: '', password: '' })
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
        identifier: form.identifier.trim(),
        password: form.password,
      })

      const normalizedRole = resolveRoleValue(loginResponse)

      navigate(
        normalizedRole === USER_ROLES.ADMIN
          ? ROUTES.ADMIN_DASHBOARD
          : ROUTES.HOME
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
        label="Tên đăng nhập hoặc Email"
        name="identifier"
        type="text"
        value={form.identifier}
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

      {/* Vị trí nút Quên mật khẩu căn phải chuẩn UI */}
      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-sky-700 hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <p className="text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link className="font-semibold text-sky-700 hover:underline" to={ROUTES.REGISTER}>
          Đăng ký ngay
        </Link>
      </p>
    </form>
  )
}

export default LoginPage