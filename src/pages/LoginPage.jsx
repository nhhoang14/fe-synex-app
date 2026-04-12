import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { ROUTES, resolveRoleValue, USER_ROLES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

function LoginPage() {
  usePageTitle('Đăng nhập - Synex')

  const navigate = useNavigate()
  const { login, loadProfile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      const loginResponse = await login(form)
      const profile = await loadProfile().catch(() => null)
      const normalizedRole = resolveRoleValue(profile) !== 'USER'
        ? resolveRoleValue(profile)
        : resolveRoleValue(loginResponse)

      navigate(normalizedRole === USER_ROLES.ADMIN ? ROUTES.ADMIN : ROUTES.ACCOUNT)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <form className="space-y-4 rounded-[28px] border border-border bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
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
      <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
        Đăng nhập
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <p className="text-sm text-slate-600">
        Chưa co tai khoan? <Link to={ROUTES.REGISTER}>Đăng ký ngay</Link>
      </p>
    </form>
  )
}

export default LoginPage
