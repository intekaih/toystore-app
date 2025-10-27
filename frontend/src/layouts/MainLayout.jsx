import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/ui/Footer';

/**
 * 🌸 MainLayout - Layout chính cho khách hàng
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
