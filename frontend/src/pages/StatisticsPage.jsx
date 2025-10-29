// src/pages/StatisticsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RevenueChart from '../components/RevenueChart';
import PaymentPieChart from '../components/PaymentPieChart';
import Toast from '../components/Toast';
import { Button, Card } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import authService from '../services/authService';
import axios from 'axios';

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
      <AdminLayout>
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-3xl">📊</span>
          Thống kê báo cáo
        </h2>
        <p className="text-gray-600 mt-1">Xem báo cáo doanh thu và thống kê</p>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6" padding="md">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn tháng:
            </label>
            <select 
              value={selectedMonth} 
              onChange={handleMonthChange} 
              className="input-cute min-w-[150px]"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn năm:
            </label>
            <select 
              value={selectedYear} 
              onChange={handleYearChange} 
              className="input-cute min-w-[150px]"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <Button 
            variant="secondary"
            onClick={() => fetchStatistics(selectedMonth, selectedYear)}
            icon="🔄"
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="md">
          <RevenueChart 
            data={chartData} 
            title="Số đơn hàng trong 7 ngày gần nhất"
          />
        </Card>

        <Card padding="md">
          <PaymentPieChart 
            data={paymentData} 
            title="Tỷ lệ đơn hàng theo trạng thái"
          />
        </Card>
      </div>

      {/* Summary Cards - Đưa xuống dưới biểu đồ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Tổng doanh thu tháng */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl text-white text-2xl flex-shrink-0">💰</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-green-700 mb-1">Tổng doanh thu tháng</h3>
              <p className="text-xl font-bold text-green-800 truncate">{formatCurrency(statistics?.tongDoanhThu)}</p>
              <span className="text-xs text-green-600">
                Tháng {selectedMonth}/{selectedYear}
              </span>
            </div>
          </div>
        </div>

        {/* Tổng số đơn hàng */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl text-white text-2xl flex-shrink-0">📦</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Tổng số đơn hàng</h3>
              <p className="text-xl font-bold text-blue-800">{statistics?.soDonHang || 0}</p>
              <span className="text-xs text-blue-600">
                Đơn hàng trong tháng
              </span>
            </div>
          </div>
        </div>

        {/* Doanh thu trung bình */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-xl text-white text-2xl flex-shrink-0">📈</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-purple-700 mb-1">Doanh thu trung bình</h3>
              <p className="text-xl font-bold text-purple-800 truncate">{formatCurrency(statistics?.doanhThuTrungBinh)}</p>
              <span className="text-xs text-purple-600">
                Trung bình/đơn hàng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {statistics?.topSanPham && statistics.topSanPham.length > 0 && (
        <Card className="mb-6" padding="md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏆 Top 5 sản phẩm bán chạy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statistics.topSanPham.map((product, index) => (
              <div key={product.sanPhamId} className="relative">
                <Card 
                  padding="md" 
                  className={`border-l-4 ${
                    index === 0 ? 'border-yellow-400 bg-yellow-50' :
                    index === 1 ? 'border-gray-400 bg-gray-50' :
                    index === 2 ? 'border-amber-600 bg-amber-50' :
                    'border-blue-400 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-500' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-blue-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 truncate">{product.tenSanPham}</h4>
                      <p className="text-sm text-gray-600">Đã bán: {product.tongSoLuongBan} sản phẩm</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(product.tongDoanhThu)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Customers */}
      {statistics?.topKhachHang && statistics.topKhachHang.length > 0 && (
        <Card padding="md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            👥 Top 5 khách hàng thân thiết
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Hạng</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Khách hàng</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Số đơn</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody>
                {statistics.topKhachHang.map((customer, index) => (
                  <tr key={customer.khachHangId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-500' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-blue-500'
                      }`}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-800">{customer.hoTen}</td>
                    <td className="py-3 px-2 text-gray-600">{customer.email}</td>
                    <td className="py-3 px-2 text-center">{customer.soDonHang}</td>
                    <td className="py-3 px-2 font-semibold text-green-600">{formatCurrency(customer.tongChiTieu)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </AdminLayout>
  );
};

export default StatisticsPage;
