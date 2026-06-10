import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminBrandsPage from './pages/AdminBrandsPage'
import AdminInventoryPage from './pages/AdminInventoryPage'
import AdminReviewsPage from './pages/AdminReviewsPage'
import AdminPromotionsPage from './pages/AdminPromotionsPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import AccountPage from './pages/AccountPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OrdersPage from './pages/OrdersPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import WishlistPage from './pages/WishlistPage'
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'
import StorefrontLayout from './layouts/StorefrontLayout'

// Thêm dòng Import chính xác vị trí của trang Quên mật khẩu
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import { ROUTES } from './constants'

export default function App() {
  return (
    <Routes>
      {/* Storefront Layout */}
      <Route element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
        <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
        
        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.ACCOUNT} element={<AccountPage />} />
          <Route path={ROUTES.CART} element={<CartPage />} />
          <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
          <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
          <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
        </Route>
      </Route>

      {/* Admin Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Auth Layout - Nơi đồng bộ chuyển trang con */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        
        {/* Khai báo Route Quên mật khẩu bằng chuỗi cứng để không sợ lỗi undefined hỏng trang */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}