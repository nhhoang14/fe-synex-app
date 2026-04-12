import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

function RegisterPage() {
  usePageTitle('Đăng ký - Synex')

  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xac nhan khong khop')
      return
    }

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      setSuccess('Đăng ký thanh cong, vui long dang nhap')
      navigate(ROUTES.LOGIN)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <form className="space-y-4 rounded-[28px] border border-border bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Đăng ký</h1>
      <FormField
        label="Ho va ten"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        required
      />
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
      <FormField
        label="Xac nhan mat khau"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />
      <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
        Tao tai khoan
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}
      <p className="text-sm text-slate-600">
        Da co tai khoan? <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
      </p>
    </form>
  )
}

export default RegisterPage
