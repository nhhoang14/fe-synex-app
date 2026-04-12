import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME, NAV_ITEMS, ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import RightOverlayPanel from './RightOverlayPanel'
import { getProducts } from '../services/catalogService'
import {
  formatCurrency,
  getCartItemProduct,
  getCartItemQuantity,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function NavBar() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { items, totalItems, totalAmount, fetchCart, increase, decrease, remove } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [products, setProducts] = useState([])
  const [cartMessage, setCartMessage] = useState('')
  const menuRef = useRef(null)
  const queryKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') || ''
  }, [location.search])

  useEffect(() => {
    if (!searchOpen) return

    let active = true
    getProducts()
      .then((data) => {
        if (!active) return
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!active) return
        setProducts([])
      })

    return () => {
      active = false
    }
  }, [searchOpen])

  useEffect(() => {
    if (!cartOpen) return

    if (!isAuthenticated) return

    fetchCart().catch(() => {
      setCartMessage('Không tải được giỏ hàng.')
    })
  }, [cartOpen, isAuthenticated, fetchCart])

  useEffect(() => {
    if (!searchOpen && !cartOpen) return

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setCartOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [searchOpen, cartOpen])

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

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    const keyword = searchKeyword.trim()

    if (keyword) {
      params.set('q', keyword)
    }

    navigate({
      pathname: ROUTES.PRODUCTS,
      search: params.toString() ? `?${params.toString()}` : '',
    })

    setSearchOpen(false)
  }

  async function handleIncrease(productId) {
    if (!isAuthenticated) return

    try {
      await increase(productId, 1)
    } catch (error) {
      setCartMessage(error.message)
    }
  }

  async function handleDecrease(productId) {
    if (!isAuthenticated) return

    try {
      await decrease(productId, 1)
    } catch (error) {
      setCartMessage(error.message)
    }
  }

  async function handleRemove(productId) {
    if (!isAuthenticated) return

    try {
      await remove(productId)
    } catch (error) {
      setCartMessage(error.message)
    }
  }

  const filteredProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return products.slice(0, 6)

    return products
      .filter((product) => String(getProductName(product)).toLowerCase().includes(keyword))
      .slice(0, 6)
  }, [products, searchKeyword])

  function handleSelectProduct(product) {
    const productName = getProductName(product)
    const params = new URLSearchParams()
    params.set('q', productName)

    navigate({
      pathname: ROUTES.PRODUCTS,
      search: `?${params.toString()}`,
    })

    setSearchKeyword(productName)
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <Link to={ROUTES.HOME} className="ml-1 text-2xl font-bold tracking-tight text-ink no-underline font-heading">
        {APP_NAME}
      </Link>

      <nav className="flex flex-wrap justify-center gap-2">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'rounded-full border px-3 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-transparent text-ink hover:bg-slate-100',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
          aria-label="Tìm kiếm"
          onClick={() => {
            setCartOpen(false)
            setSearchKeyword(queryKeyword)
            setSearchOpen(true)
          }}
        >
          <span className="material-symbols-outlined">search</span>
        </button>

        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
          aria-label="Giỏ hàng"
          onClick={() => {
            setSearchOpen(false)
            setCartMessage('')
            setCartOpen(true)
          }}
        >
          <span className="material-symbols-outlined">
            shopping_bag
          </span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-red-500 px-1 text-[0.7rem] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>

        <div className="user-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
            aria-label="Tài khoản"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined">
              person
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-40 grid min-w-40 gap-1 rounded-2xl border border-border bg-white p-1.5 shadow-soft">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to={ROUTES.ADMIN}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                    >
                      Quan tri
                    </Link>
                  )}
                  <Link
                    to={ROUTES.ACCOUNT}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    Hồ sơ
                  </Link>
                  <Link
                    to={ROUTES.ORDERS}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    Đơn hàng
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <RightOverlayPanel
        isOpen={searchOpen}
        title="Tìm kiếm"
        onClose={() => setSearchOpen(false)}
      >
        <form className="border-b border-border pb-4" onSubmit={handleSearchSubmit}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500">search</span>
            <input
              autoFocus
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Tìm sản phẩm bạn cần"
              className="w-full border-none bg-transparent text-lg font-medium text-ink outline-none placeholder:text-slate-400"
            />
            <button type="button" onClick={() => setSearchKeyword('')} className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Xóa
            </button>
          </div>
        </form>

        <div className="mt-5 mb-5 flex items-center gap-6 border-b border-border pb-3">
          <p className="text-base font-bold text-ink">Sản phẩm</p>
          <p className="text-base font-semibold text-slate-300">Gợi ý</p>
          <p className="text-base font-semibold text-slate-300">Bài đăng trên blog</p>
        </div>

        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <p className="text-sm text-slate-500">Không có sản phẩm phù hợp.</p>
          ) : (
            filteredProducts.map((product) => {
              const productId = getProductId(product) || getProductName(product)

              return (
                <button
                  key={productId}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="grid w-full grid-cols-[88px_1fr] gap-4 rounded-2xl border border-transparent p-2 text-left transition hover:border-border hover:bg-slate-50"
                >
                  <img
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    className="h-[88px] w-[88px] rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm text-slate-500">Sản phẩm</p>
                    <p className="mt-1 text-xl font-bold text-ink">{getProductName(product)}</p>
                    <p className="mt-1 text-xl font-semibold text-red-500">{formatCurrency(getProductPrice(product))}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </RightOverlayPanel>

      <RightOverlayPanel
        isOpen={cartOpen}
        title="Giỏ hàng"
        badge={totalItems}
        onClose={() => setCartOpen(false)}
        footer={(
          <div className="space-y-4">
            <div className="flex items-center justify-between text-2xl font-bold text-ink">
              <span>Tổng cộng</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to={ROUTES.CART}
                onClick={() => setCartOpen(false)}
                className="rounded-full bg-orange-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-orange-500"
              >
                Xem giỏ hàng
              </Link>
              <Link
                to={isAuthenticated && items.length > 0 ? ROUTES.CHECKOUT : ROUTES.LOGIN}
                onClick={() => setCartOpen(false)}
                className="rounded-full bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        )}
      >
        {(cartMessage || !isAuthenticated) && (
          <p className="mb-4 text-sm font-medium text-slate-600">
            {!isAuthenticated ? 'Vui lòng đăng nhập để xem giỏ hàng.' : cartMessage}
          </p>
        )}

        {!isAuthenticated ? (
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-slate-700">Đăng nhập để xem và quản lý giỏ hàng.</p>
            <Link
              to={ROUTES.LOGIN}
              onClick={() => setCartOpen(false)}
              className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 font-semibold text-white"
            >
              Đăng nhập
            </Link>
          </div>
        ) : items.length === 0 ? (
          <p className="text-slate-600">Giỏ hàng đang trống.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const product = getCartItemProduct(item)
              const productId = getProductId(product)
              const quantity = getCartItemQuantity(item)
              const price = getProductPrice(product)

              return (
                <article key={item.id || `${productId}-${quantity}`} className="grid grid-cols-[84px_1fr_auto] gap-4 rounded-2xl border border-border bg-slate-50 p-3">
                  <img
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div>
                    <h3 className="font-semibold text-ink">{getProductName(product)}</h3>
                    <p className="mt-1 text-sm text-slate-700">{formatCurrency(price)}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1">
                      <button type="button" onClick={() => handleDecrease(productId)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-slate-100">-</button>
                      <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
                      <button type="button" onClick={() => handleIncrease(productId)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-slate-100">+</button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(productId)}
                    className="h-fit rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  >
                    Loại bỏ
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </RightOverlayPanel>
    </header>
  )
}

export default NavBar
