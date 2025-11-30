// src/pages/StatisticsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, DollarSign, Package, TrendingUp, Award, Users as UsersIcon, RotateCcw, TrendingDown, Star, AlertTriangle, XCircle, ShoppingCart, ShoppingBag } from 'lucide-react';
import StarRating from '../components/StarRating';
import { statisticsService } from '../services'; // ✅ Sử dụng statisticsService
import RevenueChart from '../components/RevenueChart';
import Toast from '../components/Toast';
import { Button, Card } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import authService from '../services/authService';
import Pagination from '../components/Pagination';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State cho dữ liệu thống kê
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  // State cho filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'month', 'year'

  // State cho toast
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // State cho phân trang
  const [slowSellingPage, setSlowSellingPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const itemsPerPage = 10; // Số sản phẩm mỗi trang

  // Hiển thị toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  // Helper function để build image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    if (imagePath.startsWith('/uploads/')) return `${API_BASE_URL}${imagePath}`;
    if (!imagePath.startsWith('/')) return `${API_BASE_URL}/uploads/${imagePath}`;
    return '/barbie.jpg';
  };

  // Fetch thống kê
  const fetchStatistics = async (month, year, mode) => {
    try {
      setLoading(true);

      // Tính startDate và endDate dựa vào viewMode
      let startDate, endDate;
      
      if (mode === 'day') {
        const today = new Date();
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
        endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`;
      } else if (mode === 'month') {
        startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;
      } else if (mode === 'year') {
        startDate = `${year}-01-01 00:00:00`;
        endDate = `${year}-12-31 23:59:59`;
      }

      console.log('📅 Filter params:', { 
        month, 
        year,
        mode,
        startDate, 
        endDate
      });

      // ✅ Sử dụng statisticsService thay vì axios trực tiếp
      const response = await statisticsService.getStatistics({
        startDate,
        endDate,
        year: year,
        viewMode: mode
      });

      if (response.success) {
        const statsData = response.data.statistics || response.data;
        setStatistics(statsData);
        console.log('📊 Statistics loaded:', statsData);
        console.log('📊 Top Products:', statsData?.topSanPham);
        console.log('📊 Top Customers:', statsData?.topKhachHang);
        console.log('📊 Bad Rated Products:', statsData?.sanPhamDanhGiaXau);
        console.log('📊 Worst Products:', statsData?.sanPhamBanE);
        console.log('📊 Out of Stock:', statsData?.sanPhamHetHang);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);

      if (error.message?.includes('đăng nhập')) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.message || 'Lỗi khi tải thống kê', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê khi component mount hoặc khi thay đổi filter
  useEffect(() => {
    fetchStatistics(selectedMonth, selectedYear, viewMode);
    // Reset phân trang về trang 1 khi filter thay đổi
    setSlowSellingPage(1);
    setLowStockPage(1);
  }, [selectedMonth, selectedYear, viewMode]);

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

  // Chuẩn bị dữ liệu cho biểu đồ từ chartData
  const chartData = statistics?.chartData?.map(item => ({
    ngay: item.label,
    soDonHang: item.soDonHang,
    doanhThu: item.doanhThu
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
          <BarChart3 size={32} />
          Thống kê báo cáo
        </h2>
        <p className="text-gray-600 mt-1">Xem báo cáo doanh thu và thống kê</p>
      </div>

      {/* Quick Navigation Menu */}
      {statistics && (
        <Card className="mb-6" padding="md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Điều hướng nhanh:</h3>
          <div className="flex flex-wrap gap-2">
            <a 
              href="#top-products" 
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              📊 Top sản phẩm bán chạy
            </a>
            <a 
              href="#top-customers" 
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              👥 Top khách hàng
            </a>
            {statistics.sanPhamBanE && statistics.sanPhamBanE.length > 0 && (
              <a 
                href="#worst-products" 
                className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
              >
                ⚠️ Sản phẩm bán ế
              </a>
            )}
            {statistics.sanPhamDanhGiaXau && statistics.sanPhamDanhGiaXau.length > 0 && (
              <a 
                href="#bad-reviews" 
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                ⭐ Sản phẩm đánh giá xấu
              </a>
            )}
            {statistics.sanPhamHetHang && statistics.sanPhamHetHang.length > 0 && (
              <a 
                href="#out-of-stock" 
                className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
              >
                🛒 Sản phẩm hết hàng
              </a>
            )}
            {statistics.sanPhamBanKhongChay && statistics.sanPhamBanKhongChay.length > 0 && (
              <a 
                href="#slow-selling" 
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
              >
                📉 Sản phẩm bán không chạy
              </a>
            )}
            {statistics.hangSapHet && statistics.hangSapHet.length > 0 && (
              <a 
                href="#low-stock" 
                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
              >
                ⚡ Hàng sắp hết
              </a>
            )}
            {statistics.thongKeDanhGia && statistics.thongKeDanhGia.tongSoDanhGia > 0 && (
              <a 
                href="#review-stats" 
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                📈 Phân bố đánh giá
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="mb-6" padding="md">
        <div className="flex flex-wrap gap-4 items-end">
          {viewMode !== 'day' && (
            <>
              {viewMode === 'month' && (
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
              )}

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
            </>
          )}

          <Button 
            variant="secondary"
            onClick={() => fetchStatistics(selectedMonth, selectedYear, viewMode)}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Tổng doanh thu */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl text-white flex-shrink-0">
              <DollarSign size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-green-700 mb-1">Tổng doanh thu</h3>
              <p className="text-xl font-bold text-green-800 truncate">{formatCurrency(statistics?.tongDoanhThu)}</p>
              <span className="text-xs text-green-600">
                {viewMode === 'day' ? 'Hôm nay' : viewMode === 'month' ? `Tháng ${selectedMonth}/${selectedYear}` : `Năm ${selectedYear}`}
              </span>
            </div>
          </div>
        </div>

        {/* Tổng số đơn hàng */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl text-white flex-shrink-0">
              <Package size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Tổng số đơn hàng</h3>
              <p className="text-xl font-bold text-blue-800">{statistics?.soDonHang || 0}</p>
              <span className="text-xs text-blue-600">
                Đơn hàng trong kỳ
              </span>
            </div>
          </div>
        </div>

        {/* Doanh thu trung bình */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-xl text-white flex-shrink-0">
              <TrendingUp size={24} />
            </div>
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

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Tỷ lệ hủy đơn */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg text-white flex-shrink-0">
              <XCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-red-700 mb-1">Tỷ lệ hủy đơn</h3>
              <p className="text-lg font-bold text-red-800">{statistics?.tyLeHuyDon?.tyLe?.toFixed(1) || 0}%</p>
              <span className="text-xs text-red-600">
                {statistics?.tyLeHuyDon?.soDonHuy || 0}/{statistics?.tyLeHuyDon?.tongSoDon || 0} đơn
              </span>
            </div>
          </div>
        </div>

        {/* Đánh giá trung bình */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg text-white flex-shrink-0">
              <Star size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-yellow-700 mb-1">Đánh giá TB</h3>
              <p className="text-lg font-bold text-yellow-800">
                {statistics?.thongKeDanhGia?.diemTrungBinh?.toFixed(1) || 0}/5
              </p>
              <span className="text-xs text-yellow-600">
                {statistics?.thongKeDanhGia?.tongSoDanhGia || 0} đánh giá
              </span>
            </div>
          </div>
        </div>

        {/* Sản phẩm hết hàng */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg text-white flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-orange-700 mb-1">Hết hàng</h3>
              <p className="text-lg font-bold text-orange-800">{statistics?.sanPhamHetHang?.length || 0}</p>
              <span className="text-xs text-orange-600">sản phẩm</span>
            </div>
          </div>
        </div>

        {/* Sản phẩm đánh giá xấu */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 border border-pink-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500 rounded-lg text-white flex-shrink-0">
              <TrendingDown size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-pink-700 mb-1">Đánh giá xấu</h3>
              <p className="text-lg font-bold text-pink-800">{statistics?.sanPhamDanhGiaXau?.length || 0}</p>
              <span className="text-xs text-pink-600">sản phẩm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart với Tab Day/Month/Year */}
      <Card className="mb-6" padding="md">
        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setViewMode('day')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'day'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'month'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'year'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Year
          </button>
        </div>

        {/* Chart */}
        <RevenueChart 
          data={chartData} 
          title={
            viewMode === 'day' ? 'Doanh thu theo giờ (Hôm nay)' :
            viewMode === 'month' ? `Doanh thu theo ngày (Tháng ${selectedMonth}/${selectedYear})` :
            `Doanh thu theo tháng (Năm ${selectedYear})`
          }
        />
      </Card>

      {/* Debug Info - Chỉ hiển thị trong development */}
      {process.env.NODE_ENV === 'development' && statistics && (
        <Card className="mb-6" padding="md" style={{ backgroundColor: '#f9fafb', border: '1px dashed #d1d5db' }}>
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 font-semibold mb-2">
              🔍 Debug Info (Development only)
            </summary>
            <div className="mt-2 space-y-1 text-gray-600">
              <p>Top Products: {statistics.topSanPham?.length || 0}</p>
              <p>Top Customers: {statistics.topKhachHang?.length || 0}</p>
              <p>Worst Products: {statistics.sanPhamBanE?.length || 0}</p>
              <p>Bad Rated: {statistics.sanPhamDanhGiaXau?.length || 0}</p>
              <p>Out of Stock: {statistics.sanPhamHetHang?.length || 0}</p>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(statistics, null, 2)}
              </pre>
            </div>
          </details>
        </Card>
      )}

      {/* Thông báo khi không có dữ liệu */}
      {statistics && !statistics.topSanPham?.length && !statistics.topKhachHang?.length && 
       !statistics.sanPhamBanE?.length && !statistics.sanPhamDanhGiaXau?.length && 
       !statistics.sanPhamHetHang?.length && (
        <Card className="mb-6" padding="md">
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có dữ liệu báo cáo</h3>
            <p className="text-gray-500 mb-4">
              Trong kỳ đã chọn (Tháng {selectedMonth}/{selectedYear}) chưa có đủ dữ liệu để hiển thị các báo cáo chi tiết.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Chưa có sản phẩm bán chạy</p>
              <p>• Chưa có khách hàng thân thiết</p>
              <p>• Chưa có sản phẩm bán ế</p>
              <p>• Chưa có sản phẩm đánh giá xấu</p>
              <p>• Chưa có sản phẩm hết hàng</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 Hãy thử chọn tháng/năm khác hoặc đợi có thêm dữ liệu đơn hàng và đánh giá.
            </p>
          </div>
        </Card>
      )}

      {/* Top Products - Bảng style */}
      {statistics && (
        <Card id="top-products" className="mb-6" padding="md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award size={28} />
            Top 5 sản phẩm bán chạy
          </h2>
          {statistics.topSanPham && statistics.topSanPham.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Hạng</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ảnh</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên sản phẩm</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Đánh giá</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Giá</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Đã bán</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topSanPham.map((product, index) => {
                    const productImage = buildImageUrl(product.hinhAnh);
                    const rating = product.diemTrungBinh || 0;
                    const reviewCount = product.tongSoDanhGia || 0;
                    const category = product.loaiSP?.ten || product.loaiSP?.Ten || '';
                    
                    return (
                      <tr key={product.sanPhamId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-500' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-blue-500'
                          }`}>
                            #{index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <img 
                            src={productImage} 
                            alt={product.tenSanPham}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = '/barbie.jpg';
                            }}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <h4 className="font-bold text-gray-800 mb-1">{product.tenSanPham}</h4>
                            {category && (
                              <p className="text-sm text-gray-500">{category}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <StarRating 
                              rating={rating} 
                              size="sm"
                              className="flex-shrink-0"
                            />
                            {rating > 0 ? (
                              <span className="text-sm text-gray-600">
                                {rating.toFixed(1)}
                                {reviewCount > 0 && (
                                  <span className="text-gray-400 ml-1">({reviewCount})</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Chưa có đánh giá</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-lg font-bold text-pink-600">
                            {formatCurrency(product.giaBan || 0)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-gray-800">{product.tongSoLuongBan}</span>
                            <span className="text-xs text-gray-500">sản phẩm</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-green-600">{formatCurrency(product.tongDoanhThu)}</span>
                            <span className="text-xs text-gray-500">{product.soLanMua || 0} lần mua</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Chưa có dữ liệu sản phẩm bán chạy trong kỳ đã chọn</p>
              <p className="text-sm mt-1">Debug: topSanPham = {statistics.topSanPham ? (Array.isArray(statistics.topSanPham) ? `Array(${statistics.topSanPham.length})` : JSON.stringify(statistics.topSanPham)) : 'undefined'}</p>
            </div>
          )}
        </Card>
      )}

      {/* Top Customers */}
      {statistics && (
        <Card id="top-customers" className="mb-6" padding="md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UsersIcon size={28} />
            Top 5 khách hàng thân thiết
          </h2>
          {statistics.topKhachHang && statistics.topKhachHang.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Hạng</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Khách hàng</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">SĐT</th>
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
                      <td className="py-3 px-2 text-gray-600">{customer.dienThoai || 'N/A'}</td>
                      <td className="py-3 px-2 text-center">{customer.soDonHang}</td>
                      <td className="py-3 px-2 font-semibold text-green-600">{formatCurrency(customer.tongChiTieu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Chưa có dữ liệu khách hàng thân thiết trong kỳ đã chọn</p>
              <p className="text-sm mt-1">Debug: topKhachHang = {statistics.topKhachHang ? (Array.isArray(statistics.topKhachHang) ? `Array(${statistics.topKhachHang.length})` : JSON.stringify(statistics.topKhachHang)) : 'undefined'}</p>
            </div>
          )}
        </Card>
      )}

      {/* BÁO CÁO: Sản phẩm bán ế */}
      {statistics?.sanPhamBanE && statistics.sanPhamBanE.length > 0 && (
        <Card id="worst-products" className="mb-6" padding="md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown size={32} className="text-orange-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Báo cáo: Sản phẩm bán ế nhất
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Top {statistics.sanPhamBanE.length} sản phẩm có số lượng bán thấp nhất trong kỳ
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-orange-200 bg-orange-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hạng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sản phẩm</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Số lượng đã bán</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Số lần mua</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Tổng doanh thu</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tồn kho</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Giá bán</th>
                </tr>
              </thead>
              <tbody>
                {statistics.sanPhamBanE.map((product, index) => (
                  <tr key={product.sanPhamId} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-orange-500">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={buildImageUrl(product.hinhAnh)} 
                          alt={product.tenSanPham}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/barbie.jpg';
                          }}
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{product.tenSanPham}</h4>
                          <p className="text-xs text-gray-500">ID: {product.sanPhamId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-orange-600">{product.tongSoLuongBan}</span>
                      <span className="text-xs text-gray-500 ml-1">sản phẩm</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-700">{product.soLanMua || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-gray-800">{formatCurrency(product.tongDoanhThu)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.tonKho === 0 
                          ? 'bg-red-100 text-red-700' 
                          : product.tonKho < 10
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.tonKho}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-700">{formatCurrency(product.giaBan)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* BÁO CÁO: Sản phẩm có đánh giá xấu */}
      {statistics?.sanPhamDanhGiaXau && statistics.sanPhamDanhGiaXau.length > 0 && (
        <Card id="bad-reviews" className="mb-6" padding="md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={32} className="text-red-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Báo cáo: Sản phẩm có đánh giá xấu
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tổng hợp {statistics.sanPhamDanhGiaXau.length} sản phẩm có điểm đánh giá trung bình ≤ 3.0 sao
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {statistics.sanPhamDanhGiaXau.map((product, index) => {
              const isExpanded = expandedProducts.has(product.sanPhamId);
              
              const toggleExpand = () => {
                const newExpanded = new Set(expandedProducts);
                if (isExpanded) {
                  newExpanded.delete(product.sanPhamId);
                } else {
                  newExpanded.add(product.sanPhamId);
                }
                setExpandedProducts(newExpanded);
              };
              
              const productImage = buildImageUrl(product.hinhAnh);
              
              return (
                <div key={product.sanPhamId} className="border border-red-200 rounded-lg overflow-hidden bg-white">
                  {/* Header - Clickable để expand */}
                  <button
                    onClick={toggleExpand}
                    className="w-full p-4 bg-red-50 hover:bg-red-100 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <img 
                            src={productImage} 
                            alt={product.tenSanPham}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-red-300"
                            onError={(e) => {
                              e.target.src = '/barbie.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 truncate">{product.tenSanPham}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-red-600">
                                {product.diemTrungBinh.toFixed(1)}/5.0
                              </span>
                            </div>
                            <span className="text-gray-600">
                              {product.soLuongDanhGia} đánh giá
                            </span>
                            <span className="text-gray-600">
                              {formatCurrency(product.giaBan)}
                            </span>
                            <span className="text-gray-600">
                              Tồn kho: {product.tonKho}
                            </span>
                          </div>
                          <div className="flex gap-3 mt-2 text-xs">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                              1⭐: {product.soDanhGia1Sao || 0}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              2⭐: {product.soDanhGia2Sao || 0}
                            </span>
                            {product.soDanhGia3Sao > 0 && (
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                3⭐: {product.soDanhGia3Sao}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expandable Content - Đánh giá chi tiết */}
                  {isExpanded && (
                    <div className="border-t border-red-200 bg-gray-50 p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        Đánh giá xấu ({product.danhGiaChiTiet?.length || 0} đánh giá)
                      </h4>
                      
                      {product.danhGiaChiTiet && product.danhGiaChiTiet.length > 0 ? (
                        <div className="space-y-3">
                          {product.danhGiaChiTiet.map((review) => (
                            <div 
                              key={review.id} 
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                                    review.soSao === 1 ? 'bg-red-500 text-white' :
                                    review.soSao === 2 ? 'bg-orange-500 text-white' :
                                    'bg-yellow-500 text-white'
                                  }`}>
                                    {review.soSao} ⭐
                                  </div>
                                  {review.nguoiDanhGia && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">
                                        {review.nguoiDanhGia.hoTen || 'Khách hàng'}
                                      </p>
                                      <p className="text-xs text-gray-500">{review.nguoiDanhGia.email}</p>
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {review.ngayTao ? new Date(review.ngayTao).toLocaleDateString('vi-VN') : ''}
                                </span>
                              </div>
                              
                              {review.noiDung && (
                                <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                                  {review.noiDung}
                                </p>
                              )}
                              
                              {review.hinhAnh && (
                                <div className="mt-2">
                                  <img 
                                    src={buildImageUrl(review.hinhAnh)} 
                                    alt="Đánh giá"
                                    className="max-w-xs h-32 object-cover rounded-lg border border-gray-300"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Không có đánh giá chi tiết</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* BÁO CÁO: Sản phẩm bán không chạy */}
      {statistics?.sanPhamBanKhongChay && statistics.sanPhamBanKhongChay.length > 0 && (
        <Card id="slow-selling" className="mb-6" padding="md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown size={32} className="text-indigo-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Báo cáo: Sản phẩm bán không chạy
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cảnh báo: {statistics.sanPhamBanKhongChay.length} sản phẩm có số lượng bán thấp (&lt; 10 sản phẩm) trong kỳ
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-indigo-200 bg-indigo-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hạng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sản phẩm</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Số lượng đã bán</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Số lần mua</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tồn kho</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Giá bán</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Sắp xếp và phân trang
                  const sortedProducts = [...statistics.sanPhamBanKhongChay].sort((a, b) => {
                    const aSoLuongBan = a.tongSoLuongBan || 0;
                    const bSoLuongBan = b.tongSoLuongBan || 0;
                    const aSoLanMua = a.soLanMua || 0;
                    const bSoLanMua = b.soLanMua || 0;
                    
                    if (aSoLuongBan === 0 && bSoLuongBan === 0) {
                      return aSoLanMua - bSoLanMua;
                    }
                    if (aSoLuongBan === 0) return -1;
                    if (bSoLuongBan === 0) return 1;
                    return aSoLuongBan - bSoLuongBan;
                  });
                  
                  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
                  const startIndex = (slowSellingPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
                  
                  return paginatedProducts.map((product, index) => (
                  <tr key={product.sanPhamId} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-indigo-500">
                        #{startIndex + index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={buildImageUrl(product.hinhAnh)} 
                          alt={product.tenSanPham}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/barbie.jpg';
                          }}
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{product.tenSanPham}</h4>
                          <p className="text-xs text-gray-500">ID: {product.sanPhamId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-indigo-600">{product.tongSoLuongBan}</span>
                      <span className="text-xs text-gray-500 ml-1">sản phẩm</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-700">{product.soLanMua || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.tonKho === 0 
                          ? 'bg-red-100 text-red-700' 
                          : product.tonKho < 10
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.tonKho}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-700">{formatCurrency(product.giaBan)}</span>
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          
          {/* Phân trang cho Sản phẩm bán không chạy */}
          {(() => {
            const sortedProducts = [...statistics.sanPhamBanKhongChay].sort((a, b) => {
              const aSoLuongBan = a.tongSoLuongBan || 0;
              const bSoLuongBan = b.tongSoLuongBan || 0;
              const aSoLanMua = a.soLanMua || 0;
              const bSoLanMua = b.soLanMua || 0;
              
              if (aSoLuongBan === 0 && bSoLuongBan === 0) {
                return aSoLanMua - bSoLanMua;
              }
              if (aSoLuongBan === 0) return -1;
              if (bSoLuongBan === 0) return 1;
              return aSoLuongBan - bSoLuongBan;
            });
            const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
            
            return totalPages > 1 ? (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={slowSellingPage}
                  totalPages={totalPages}
                  onPageChange={setSlowSellingPage}
                />
              </div>
            ) : null;
          })()}
        </Card>
      )}

      {/* BÁO CÁO: Sản phẩm hết hàng */}
      {statistics?.sanPhamHetHang && statistics.sanPhamHetHang.length > 0 && (
        <Card id="out-of-stock" className="mb-6" padding="md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart size={32} className="text-orange-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Báo cáo: Sản phẩm hết hàng
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cảnh báo: {statistics.sanPhamHetHang.length} sản phẩm đang hết hàng (tồn kho = 0)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {statistics.sanPhamHetHang.map((product) => (
              <div key={product.sanPhamId} className="relative">
                <Card 
                  padding="md" 
                  className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-46 h-46 aspect-square">
                      <img 
                        src={buildImageUrl(product.hinhAnh)} 
                        alt={product.tenSanPham}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/barbie.jpg';
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                        ID: {product.sanPhamId}
                      </div>
                      <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                        HẾT HÀNG
                      </div>
                    </div>
                    <div className="w-full text-left">
                      <h4 className="font-bold text-gray-800 truncate mb-2 text-sm text-left">{product.tenSanPham}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 text-left">Tồn kho</p>
                          <p className="text-base font-bold text-red-600 text-left">0</p>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[10px] text-gray-500">Giá bán</p>
                          <p className="text-base font-bold text-gray-800">{formatCurrency(product.giaBan)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* BÁO CÁO: Hàng sắp hết */}
      {statistics?.hangSapHet && statistics.hangSapHet.length > 0 && (
        <Card id="low-stock" className="mb-6" padding="md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={32} className="text-amber-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Báo cáo: Hàng sắp hết
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cảnh báo: {statistics.hangSapHet.length} sản phẩm có tồn kho thấp (≤ 10 sản phẩm) - Cần nhập hàng ngay
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {(() => {
              const startIndex = (lowStockPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedProducts = statistics.hangSapHet.slice(startIndex, endIndex);
              
              return paginatedProducts.map((product) => (
              <div key={product.sanPhamId} className="relative">
                <Card 
                  padding="md" 
                  className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-46 h-46 aspect-square">
                      <img 
                        src={buildImageUrl(product.hinhAnh)} 
                        alt={product.tenSanPham}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/barbie.jpg';
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                        ID: {product.sanPhamId}
                      </div>
                      <div className={`absolute top-1 right-1 text-white px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        product.soLuongTon <= 3 
                          ? 'bg-red-500' 
                          : product.soLuongTon <= 5
                          ? 'bg-orange-500'
                          : 'bg-amber-500'
                      }`}>
                        {product.soLuongTon <= 3 ? 'CẤP BÁCH' : product.soLuongTon <= 5 ? 'SẮP HẾT' : 'THẤP'}
                      </div>
                    </div>
                    <div className="w-full text-left">
                      <h4 className="font-bold text-gray-800 truncate mb-2 text-sm text-left">{product.tenSanPham}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 text-left">Tồn kho</p>
                          <p className={`text-base font-bold text-left ${
                            product.soLuongTon <= 3 
                              ? 'text-red-600' 
                              : product.soLuongTon <= 5
                              ? 'text-orange-600'
                              : 'text-amber-600'
                          }`}>
                            {product.soLuongTon}
                          </p>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[10px] text-gray-500">Giá bán</p>
                          <p className="text-base font-bold text-gray-800">{formatCurrency(product.giaBan)}</p>
                        </div>

                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              ));
            })()}
          </div>
          
          {/* Phân trang cho Hàng sắp hết */}
          {(() => {
            const totalPages = Math.ceil(statistics.hangSapHet.length / itemsPerPage);
            
            return totalPages > 1 ? (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={lowStockPage}
                  totalPages={totalPages}
                  onPageChange={setLowStockPage}
                />
              </div>
            ) : null;
          })()}
        </Card>
      )}

      {/* Thống kê đánh giá chi tiết */}
      {statistics?.thongKeDanhGia && statistics.thongKeDanhGia.tongSoDanhGia > 0 && (
        <Card id="review-stats" padding="md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={28} className="text-yellow-500" />
            Phân bố đánh giá
          </h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((sao) => {
              const soLuong = statistics.thongKeDanhGia.phanBoSao?.[sao] || 0;
              const tongSo = statistics.thongKeDanhGia.tongSoDanhGia || 1;
              const tyLe = (soLuong / tongSo) * 100;
              
              return (
                <div key={sao} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-semibold text-gray-700">{sao}</span>
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        sao === 5 ? 'bg-green-500' :
                        sao === 4 ? 'bg-blue-500' :
                        sao === 3 ? 'bg-yellow-500' :
                        sao === 2 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${tyLe}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-24 text-right">
                    {soLuong} ({tyLe.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tổng số đánh giá:</span>
                <span className="text-lg font-bold text-gray-800">{statistics.thongKeDanhGia.tongSoDanhGia}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">Điểm trung bình:</span>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold text-gray-800">
                    {statistics.thongKeDanhGia.diemTrungBinh.toFixed(2)}/5
                  </span>
                </div>
              </div>
            </div>
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

