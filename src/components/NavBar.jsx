import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

function NavBar() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function handleLogout() {
    setMenuOpen(false)
    logout()
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Synex
      </Link>

      <nav className="site-nav">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/products">Sản phẩm</NavLink>
        <NavLink to="/contact">Liên hệ</NavLink>
      </nav>

      <div className="header-actions">
        <Link to="/cart" className="icon-circle-btn" aria-label="Giỏ hàng">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 6h14l-1.6 7.2a2 2 0 0 1-2 1.6H9.4a2 2 0 0 1-2-1.5L5.8 4.8A2 2 0 0 0 3.9 3H2" />
            <circle cx="10" cy="19" r="1.6" />
            <circle cx="17" cy="19" r="1.6" />
          </svg>
          {totalItems > 0 && <span className="icon-badge">{totalItems}</span>}
        </Link>

        <div className="user-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="icon-circle-btn"
            aria-label="Tài khoản"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
            </svg>
          </button>

          {menuOpen && (
            <div className="user-menu-dropdown">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      Quan tri
                    </Link>
                  )}
                  <Link to="/account" onClick={() => setMenuOpen(false)}>
                    Hồ sơ
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default NavBar
