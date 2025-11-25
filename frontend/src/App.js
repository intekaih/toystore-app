import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import Homepage from './pages/Homepage.js';
import ProductList from './pages/Products/ProductList.js';
import ProductDetail from './pages/Products/ProductDetail.js';
import CartPage from './pages/CartPage.js';
import CheckoutPage from './pages/CheckoutPage.js';
import PaymentMethodPage from './pages/PaymentMethodPage.js';
import OrderHistoryPage from './pages/OrderHistoryPage.js';
import OrderDetailPage from './pages/OrderDetailPage.js';
import OrderLookupPage from './pages/OrderLookupPage.js';
import PaymentReturnPage from './pages/PaymentReturnPage.js';
import Login from './pages/LoginPage.js';
import Register from './pages/RegisterPage.js';
import Profile from './pages/ProfilePage.js';
import EditProfilePage from './pages/EditProfilePage.js';
import AdminLoginPage from './pages/AdminLoginPage.js';
import AdminDashboard from './pages/AdminDashboard.js';
import UserManagementPage from './pages/UserManagementPage.js';
import CategoryManagementPage from './pages/CategoryManagementPage.js';
import BrandManagementPage from './pages/BrandManagementPage.jsx';
import ProductManagementPage from './pages/ProductManagementPage.jsx';
import OrderManagementPage from './pages/OrderManagementPage.jsx';
import StatisticsPage from './pages/StatisticsPage.jsx';
import VoucherManagementPage from './pages/VoucherManagementPage.jsx';
import GHNManagementPage from './pages/GHNManagementPage.jsx';
import GHNMockTestPage from './pages/GHNMockTestPage.jsx';
// ✅ THÊM: Import các trang đánh giá
import ReviewableProductsPage from './pages/ReviewableProductsPage.jsx';
import AdminReviewManagementPage from './pages/AdminReviewManagementPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.js';
import AdminRoute from './components/AdminRoute.js';
// ✅ THÊM: Import StaffRoute và các trang Staff
import StaffRoute from './components/StaffRoute.js';
import StaffDashboard from './pages/StaffDashboard.js';
import './index.css';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Payment return route (public - VNPay redirect) */}
              <Route path="/payment/return" element={<PaymentReturnPage />} />
              
              {/* ✅ Guest order detail - Public route (không cần đăng nhập) */}
              <Route path="/order/:orderCode" element={<OrderDetailPage />} />
              
              {/* ✅ Guest order lookup - Public route (tra cứu đơn hàng) */}
              <Route path="/order-lookup" element={<OrderLookupPage />} />
              
              {/* ✅ PUBLIC ROUTES - Không cần đăng nhập */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-method" element={<PaymentMethodPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <UserManagementPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <AdminRoute>
                    <CategoryManagementPage />
                  </AdminRoute>
                } 
              />
              {/* ✅ MỚI: Quản lý Thương hiệu */}
              <Route 
                path="/admin/brands" 
                element={
                  <AdminRoute>
                    <BrandManagementPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <AdminRoute>
                    <ProductManagementPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <AdminRoute>
                    <OrderManagementPage />
                  </AdminRoute>
                } 
              />
              {/* ✅ MỚI: Quản lý Voucher */}
              <Route 
                path="/admin/vouchers" 
                element={
                  <AdminRoute>
                    <VoucherManagementPage />
                  </AdminRoute>
                } 
              />
              {/* ✅ MỚI: Quản lý GHN - Theo dõi vận chuyển */}
              <Route 
                path="/admin/ghn-tracking" 
                element={
                  <AdminRoute>
                    <GHNManagementPage />
                  </AdminRoute>
                } 
              />
              {/* ✅ MỚI: GHN Mock Test - Công cụ test mock mode */}
              <Route 
                path="/admin/ghn-mock-test" 
                element={
                  <AdminRoute>
                    <GHNMockTestPage />
                  </AdminRoute>
                } 
              />
              {/* ✅ MỚI: Quản lý Đánh giá (Admin) */}
              <Route 
                path="/admin/reviews" 
                element={
                  <AdminRoute>
                    <AdminReviewManagementPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/statistics" 
                element={
                  <AdminRoute>
                    <StatisticsPage />
                  </AdminRoute>
                } 
              />
              
              {/* =======================================
                  STAFF ROUTES - Dành cho Nhân viên
                  ======================================= */}
              <Route 
                path="/staff/dashboard" 
                element={
                  <StaffRoute>
                    <StaffDashboard />
                  </StaffRoute>
                } 
              />
              <Route 
                path="/staff/orders" 
                element={
                  <StaffRoute>
                    <OrderManagementPage isStaffView={true} />
                  </StaffRoute>
                } 
              />
              <Route 
                path="/staff/orders/:id" 
                element={
                  <StaffRoute>
                    <OrderDetailPage isStaffView={true} />
                  </StaffRoute>
                } 
              />
              <Route 
                path="/staff/products" 
                element={
                  <StaffRoute>
                    <ProductManagementPage isStaffView={true} />
                  </StaffRoute>
                } 
              />
              
              {/* Protected routes (User) */}
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } 
              />
              {/* ✅ MỚI: Sản phẩm có thể đánh giá (User) */}
              <Route 
                path="/reviews/reviewable" 
                element={
                  <ProtectedRoute>
                    <ReviewableProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Component 404 Not Found
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-rose-50">
      <div className="text-center p-8 bg-white rounded-bubble shadow-bubble max-w-md">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-6xl font-display font-bold text-gradient-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Trang không tìm thấy</h2>
        <p className="text-gray-600 mb-6">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
        </p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold rounded-cute shadow-soft hover:shadow-cute transition-all"
        >
          🏠 Về trang chủ
        </a>
      </div>
    </div>
  );
};

export default App;