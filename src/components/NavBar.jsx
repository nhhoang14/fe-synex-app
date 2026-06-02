import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME, NAV_ITEMS, ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
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
import RightOverlayPanel from './RightOverlayPanel'

function NavBar() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { items, totalItems, totalAmount, fetchCart } = useCart()

  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // State quản lý việc hiển thị Mini Cart khi di chuột (Hover)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  
  const [searchKeyword, setSearchKeyword] = useState('')
  const [products, setProducts] = useState([])
  const [cartMessage, setCartMessage] = useState('')

  const menuRef = useRef(null)

  const queryKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') || ''
  }, [location.search])

  // Fetch sản phẩm cho thanh tìm kiếm
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

  // Lấy giỏ hàng khi Hover mở Mini Cart
  useEffect(() => {
    if (!cartDropdownOpen || !isAuthenticated) return

    fetchCart().catch(() => {
      setCartMessage('Không tải được giỏ hàng.')
    })
  }, [cartDropdownOpen, isAuthenticated, fetchCart])

  // Đóng Search hoặc Mini Cart khi ấn ESC
  useEffect(() => {
    if (!searchOpen && !cartDropdownOpen) return

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setCartDropdownOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [searchOpen, cartDropdownOpen])

  // Đóng Menu User khi click ra ngoài
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

    const keyword = searchKeyword.trim()
    const params = new URLSearchParams()

    if (keyword) {
      params.set('q', keyword)
    }

    navigate({
      pathname: ROUTES.PRODUCTS,
      search: params.toString() ? `?${params.toString()}` : '',
    })

    setSearchOpen(false)
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
      <Link
        to={ROUTES.HOME}
        className="ml-1 inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-ink no-underline font-heading"
      >
        <span
          className="material-symbols-outlined text-[28px] text-blue-500"
          aria-hidden="true"
        >
          automation
        </span>
        <span>{APP_NAME}</span>
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
        {/* NÚT TÌM KIẾM */}
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
          aria-label="Tìm kiếm"
          onClick={() => {
            setCartDropdownOpen(false)
            setSearchKeyword(queryKeyword)
            setSearchOpen(true)
          }}
        >
          <span className="material-symbols-outlined">search</span>
        </button>

        {/* CỤM MINICART: Hover sẽ hiện Dropdown, Click sẽ tới trang Giỏ Hàng */}
        <div
          className="relative inline-flex items-center"
          onMouseEnter={() => {
            setSearchOpen(false)
            setCartMessage('')
            setCartDropdownOpen(true)
          }}
          onMouseLeave={() => setCartDropdownOpen(false)}
        >
          <Link
            to={ROUTES.CART}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
            aria-label="Giỏ hàng"
            onClick={() => setCartDropdownOpen(false)}
          >
            <span className="material-symbols-outlined">shopping_bag</span>

            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-red-500 px-1 text-[0.7rem] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {/* DROPDOWN MINICART */}
          {cartDropdownOpen && (
            <div className="absolute right-0 top-[100%] z-50 pt-3 cursor-default animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-[380px] rounded-[24px] border border-border bg-white p-5 shadow-2xl flex flex-col max-h-[85vh]">
                <h3 className="text-lg font-bold text-ink mb-4 shrink-0">Sản phẩm mới thêm</h3>

                <div className="overflow-y-auto filter-scrollbar pr-2 flex flex-col gap-3 flex-1">
                  {(cartMessage || !isAuthenticated) && (
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      {!isAuthenticated ? 'Vui lòng đăng nhập để xem giỏ hàng.' : cartMessage}
                    </p>
                  )}

                  {!isAuthenticated ? (
                    <div className="rounded-2xl border border-border bg-slate-50 p-4">
                      <p className="text-sm text-slate-700">Đăng nhập để xem và quản lý giỏ hàng.</p>
                      <Link
                        to={ROUTES.LOGIN}
                        onClick={() => setCartDropdownOpen(false)}
                        className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Đăng nhập
                      </Link>
                    </div>
                  ) : items.length === 0 ? (
                    <p className="text-sm text-slate-500 italic py-4">Giỏ hàng đang trống.</p>
                  ) : (
                    // Lấy tối đa 5 sản phẩm
                    items.slice(0, 5).map((item) => {
                      const product = getCartItemProduct(item)
                      const productId = getProductId(product)
                      const quantity = getCartItemQuantity(item)
                      const price = getProductPrice(product)

                      return (
                        <article
                          key={item.id || `${productId}-${quantity}`}
                          className="grid grid-cols-[64px_1fr] gap-4 rounded-2xl border border-border bg-slate-50 p-2.5 items-center transition hover:border-slate-300"
                        >
                          <img
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            className="h-16 w-16 rounded-xl object-cover border border-border bg-white"
                          />

                          <div className="flex flex-col justify-center min-w-0 pr-1">
                            <h4 className="font-semibold text-ink text-sm truncate" title={getProductName(product)}>
                              {getProductName(product)}
                            </h4>
                            <p className="mt-0.5 text-sm font-bold text-red-500">{formatCurrency(price)}</p>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Số lượng: {quantity}
                            </p>
                          </div>
                        </article>
                      )
                    })
                  )}
                </div>

                {/* Footer Giỏ hàng */}
                {isAuthenticated && items.length > 0 && (
                  <div className="border-t border-border mt-4 pt-4 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600 pl-2">
                        {totalItems} Sản phẩm trong giỏ
                      </span>

                      <Link
                        to={ROUTES.CART}
                        onClick={() => setCartDropdownOpen(false)}
                        className="rounded-full bg-slate-900 px-6 py-2.5 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Xem giỏ hàng
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NÚT TÀI KHOẢN */}
        <div className="user-menu-wrap relative inline-flex items-center" ref={menuRef}>
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
            aria-label="Tài khoản"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined">person</span>
          </button>

          {menuOpen && (
            <div className="absolute right-[-24px] top-[calc(100%+8px)] z-40 grid min-w-40 gap-1 rounded-2xl border border-border bg-white p-1.5 shadow-soft">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to={ROUTES.ADMIN}
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                    >
                      <span
                        className="material-symbols-outlined text-[20px] text-blue-500"
                        aria-hidden="true"
                      >
                        admin_panel_settings
                      </span>
                      Quản trị
                    </Link>
                  )}

                  <Link
                    to={ROUTES.ACCOUNT}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-blue-500"
                      aria-hidden="true"
                    >
                      person
                    </span>
                    Hồ sơ
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-blue-500"
                      aria-hidden="true"
                    >
                      logout
                    </span>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-blue-500"
                      aria-hidden="true"
                    >
                      login
                    </span>
                    Đăng nhập
                  </Link>

                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-ink transition hover:bg-slate-100"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-blue-500"
                      aria-hidden="true"
                    >
                      app_registration
                    </span>
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PANEL TÌM KIẾM BÊN PHẢI (GIỮ NGUYÊN) */}
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

            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Xóa
            </button>
          </div>
        </form>

        <div className="mb-5 mt-5 flex items-center gap-6 border-b border-border pb-3">
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
                    <p className="mt-1 text-xl font-bold text-ink">
                      {getProductName(product)}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-red-500">
                      {formatCurrency(getProductPrice(product))}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </RightOverlayPanel>
    </header>
  )
}

export default NavBar