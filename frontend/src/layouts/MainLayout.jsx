import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/ui/Footer';
import { useLocation } from 'react-router-dom';
import CategoryNavigationBar from '../components/CategoryNavigationBar';

/**
 * 🌸 MainLayout - Layout chính cho khách hàng
 */
const MainLayout = ({ children }) => {
  const location = useLocation();
  const showCategoryBar = location.pathname === '/' || location.pathname.startsWith('/products');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {showCategoryBar && <CategoryNavigationBar />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
