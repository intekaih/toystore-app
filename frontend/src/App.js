import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar, ProtectedRoute } from './components/layout';
import { HomePage } from './pages/Home';
import { ProductList, ProductDetail } from './pages/Product';
import { LoginPage, RegisterPage } from './pages/Auth';
import { ProfilePage, EditProfilePage } from './pages/Profile';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderHistoryPage from './pages/Orders/OrderHistoryPage';
import './index.css';
import './App.css';
import './pages/Home/Homepage.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <div className="page-wrapper">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
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
                    <Route 
                      path="/cart" 
                      element={
                        <ProtectedRoute>
                          <CartPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <OrderHistoryPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Catch all route - 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

// Component 404 Not Found
const NotFound = () => {
  return (
    <div className="page-enter">
      <div className="card text-center" style={{ margin: '3rem auto', maxWidth: '500px' }}>
        <div className="card-body">
          <h1 style={{ fontSize: '4rem', margin: '1rem 0' }}>404</h1>
          <h2 style={{ color: '#6b7280', marginBottom: '1rem' }}>Trang không tìm thấy</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
          </p>
          <a href="/" className="btn btn-primary">
            🏠 Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;