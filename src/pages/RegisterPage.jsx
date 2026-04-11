import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../contexts/AuthContext'

function RegisterPage() {
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
      navigate('/login')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="center-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Đăng ký</h1>
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
        <button type="submit">Tao tai khoan</button>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <p className="hint">
          Da co tai khoan? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
