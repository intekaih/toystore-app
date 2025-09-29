import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import Navbar from './components/Navbar.js';
import Homepage from './pages/Homepage.js';
import ProductList from './pages/Products/ProductList.js';
import ProductDetail from './pages/Products/ProductDetail.js';
import Login from './pages/LoginPage.js';
import Register from './pages/RegisterPage.js';
import Profile from './pages/ProfilePage.js';
import EditProfilePage from './pages/EditProfilePage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import './index.css';
import './App.css';
import './pages/Homepage.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <div className="page-wrapper">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes */}
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
            </main>
          </div>
        </div>
      </Router>
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