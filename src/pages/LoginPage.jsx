import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
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
      await login(form)
      const profile = await loadProfile()
      const normalizedRole = String(profile?.role || profile?.userRole || 'USER')
        .replace('ROLE_', '')
        .toUpperCase()

      navigate(normalizedRole === 'ADMIN' ? '/admin' : '/account')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="center-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
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
        <button type="submit">Đăng nhập</button>
        {error && <p className="error-text">{error}</p>}
        <p className="hint">
          Chưa co tai khoan? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
