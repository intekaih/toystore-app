// src/pages/StatisticsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RevenueChart from '../components/RevenueChart';
import PaymentPieChart from '../components/PaymentPieChart';
import Toast from '../components/Toast';
import authService from '../services/authService';
import axios from 'axios';
import '../styles/StatisticsPage.css';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State cho dữ liệu thống kê
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State cho toast
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // Hiển thị toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  // Fetch thống kê
  const fetchStatistics = async (month, year) => {
    try {
      setLoading(true);

      const token = authService.getToken();
      if (!token) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
        return;
      }

      // Tính startDate và endDate cho tháng được chọn - SỬA: Format date đúng cho SQL Server
      const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
      // Tháng trong JavaScript bắt đầu từ 0, nên month sẽ cho ta tháng tiếp theo
      // Sau đó lấy ngày 0 (= ngày cuối tháng hiện tại)
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;

      console.log('📅 Filter params:', { 
        month, 
        year, 
        lastDay,
        startDate, 
        endDate,
        startDateObject: new Date(startDate),
        endDateObject: new Date(endDate)
      });

      const response = await axios.get('http://localhost:5000/api/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          startDate,
          endDate
        }
      });

      if (response.data.success) {
        setStatistics(response.data.data.statistics);
        console.log('📊 Statistics loaded:', response.data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);

      if (error.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.response?.data?.message || 'Lỗi khi tải thống kê', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê khi component mount hoặc khi thay đổi filter
  useEffect(() => {
    fetchStatistics(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Xử lý thay đổi tháng
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  // Xử lý thay đổi năm
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Format số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value || 0);
  };

  // Chuẩn bị dữ liệu cho biểu đồ cột (7 ngày gần nhất)
  const chartData = statistics?.bays7NgayGanNhat?.map(item => ({
    ngay: new Date(item.ngay).toLocaleDateString('vi-VN'),
    soDonHang: item.soDonHang,
    doanhThu: item.doanhThu
  })) || [];

  // Chuẩn bị dữ liệu cho biểu đồ tròn (phương thức thanh toán)
  // Giả sử backend trả về dữ liệu theo phương thức thanh toán
  // Nếu không có, chúng ta sẽ tạo dữ liệu mẫu
  const paymentData = statistics?.theoTrangThai?.map(item => ({
    name: item.trangThai,
    value: item.soLuong,
    tongTien: item.tongTien
  })) || [];

  // Tạo danh sách năm (từ 2020 đến năm hiện tại + 1)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = 2020; y <= currentYear + 1; y++) {
    years.push(y);
  }

  // Danh sách tháng
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ⬅️ Dashboard
            </button>
            <h1>📊 Thống kê đơn hàng</h1>
          </div>
          <div className="header-right">
            <span className="welcome-text">Xin chào, <strong>{user?.hoTen || 'Admin'}</strong></span>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Chọn tháng:</label>
            <select value={selectedMonth} onChange={handleMonthChange} className="filter-select">
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Chọn năm:</label>
            <select value={selectedYear} onChange={handleYearChange} className="filter-select">
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn-refresh" 
            onClick={() => fetchStatistics(selectedMonth, selectedYear)}
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card revenue">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Tổng doanh thu tháng</h3>
              <p className="value">{formatCurrency(statistics?.tongDoanhThu)}</p>
              <span className="label">
                Tháng {selectedMonth}/{selectedYear}
              </span>
            </div>
          </div>

          <div className="summary-card orders">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <h3>Tổng số đơn hàng</h3>
              <p className="value">{statistics?.soDonHang || 0}</p>
              <span className="label">
                Đơn hàng trong tháng
              </span>
            </div>
          </div>

          <div className="summary-card average">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Doanh thu trung bình</h3>
              <p className="value">{formatCurrency(statistics?.doanhThuTrungBinh)}</p>
              <span className="label">
                Trung bình/đơn hàng
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <RevenueChart 
              data={chartData} 
              title="Số đơn hàng trong 7 ngày gần nhất"
            />
          </div>

          <div className="chart-card">
            <PaymentPieChart 
              data={paymentData} 
              title="Tỷ lệ đơn hàng theo trạng thái"
            />
          </div>
        </div>

        {/* Top Products */}
        {statistics?.topSanPham && statistics.topSanPham.length > 0 && (
          <div className="top-products-section">
            <h2>🏆 Top 5 sản phẩm bán chạy</h2>
            <div className="products-grid">
              {statistics.topSanPham.map((product, index) => (
                <div key={product.sanPhamId} className="product-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="product-info">
                    <h4>{product.tenSanPham}</h4>
                    <p className="sold">Đã bán: {product.tongSoLuongBan} sản phẩm</p>
                    <p className="revenue">Doanh thu: {formatCurrency(product.tongDoanhThu)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Customers */}
        {statistics?.topKhachHang && statistics.topKhachHang.length > 0 && (
          <div className="top-customers-section">
            <h2>👥 Top 5 khách hàng thân thiết</h2>
            <div className="customers-table">
              <table>
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Số đơn</th>
                    <th>Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topKhachHang.map((customer, index) => (
                    <tr key={customer.khachHangId}>
                      <td className="rank-cell">
                        <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
                      </td>
                      <td>{customer.hoTen}</td>
                      <td>{customer.email}</td>
                      <td>{customer.soDonHang}</td>
                      <td className="amount">{formatCurrency(customer.tongChiTieu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default StatisticsPage;
