import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services'; // ✅ Sử dụng orderService
import staffService from '../services/staffService';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import { Button, Badge, Loading, Modal } from '../components/ui';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Calendar, CreditCard, FileText, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';
import GHNTracking from '../components/GHNTracking';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import config from '../config';

const OrderDetailPage = ({ isStaffView = false }) => {
  // Backend API URL
  const API_BASE_URL = config.API_BASE_URL;

  // Build full image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '') return '/barbie.jpg';

    // Nếu đã là full URL thì return luôn
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Nếu bắt đầu bằng /uploads/ thì thêm API_BASE_URL
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }

    // Nếu không bắt đầu bằng / thì thêm /uploads/
    if (!imagePath.startsWith('/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }

    // Fallback
    return '/barbie.jpg';
  };

  const handleImageError = (e) => {
    console.warn('❌ Lỗi load ảnh trong chi tiết đơn hàng:', e.target.src);
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
    }
  };

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, orderCode } = useParams();

  // ✅ Xác định loại route: /order/:orderCode (guest) hay /orders/:id (user)
  const isPublicRoute = location.pathname.startsWith('/order/');
  const isGuestView = !user && isPublicRoute;

  useEffect(() => {
    loadOrderDetail();
  }, [id, orderCode, user]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);

      let response;

      // ✅ Sử dụng service tương ứng với role
      if (isStaffView && id) {
        // Staff: sử dụng staffService
        console.log('👨‍💼 Staff - Lấy đơn hàng:', id);
        response = await staffService.getOrderDetail(id);

        if (response.success) {
          // Backend đã normalize giống admin, sử dụng trực tiếp
          const orderData = response.data;
          console.log('📦 Order data from backend (normalized like admin):', orderData);

          // Backend trả về format giống admin, chỉ cần map lại cho đúng với component
          const normalizedOrder = {
            id: orderData.id,
            maHD: orderData.maHd || orderData.maHD,
            trangThai: orderData.trangThai,
            tongTien: orderData.thanhTien || orderData.tongTien || 0,
            thanhTien: orderData.thanhTien || 0,
            ngayLap: orderData.ngayLap,
            // Khách hàng - backend đã normalize với taiKhoan
            khachHang: {
              hoTen: orderData.khachHang?.taiKhoan?.hoTen || orderData.khachHang?.hoTen || '',
              dienThoai: orderData.khachHang?.taiKhoan?.dienThoai || orderData.khachHang?.dienThoai || '',
              email: orderData.khachHang?.taiKhoan?.email || orderData.khachHang?.email || ''
            },
            // Phương thức thanh toán
            phuongThucThanhToan: {
              ten: orderData.phuongThucThanhToan?.ten || '',
              id: orderData.phuongThucThanhToan?.id
            },
            // Chi tiết đơn hàng - backend đã normalize, DTOMapper convert HinhAnhURL → hinhAnhUrl
            chiTiet: (orderData.chiTiet || []).map(item => ({
              id: item.id,
              soLuong: item.soLuong || 0,
              donGia: item.donGia || 0,
              thanhTien: item.thanhTien || 0,
              sanPham: {
                id: item.sanPham?.id,
                ten: item.sanPham?.ten || 'Sản phẩm không xác định',
                giaBan: item.sanPham?.giaBan || item.donGia || 0,
                hinhAnhURL: item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL || '',
                loaiSP: item.sanPham?.loaiSp || item.sanPham?.loaiSP || {}
              }
            })),
            ghiChu: orderData.ghiChu || '',
            // Địa chỉ giao hàng - backend đã normalize
            diaChiGiaoHang: orderData.diaChiGiaoHang ? {
              id: orderData.diaChiGiaoHang.id,
              diaChiChiTiet: orderData.diaChiGiaoHang.diaChiChiTiet || '',
              tenPhuong: orderData.diaChiGiaoHang.tenPhuong || '',
              tenQuan: orderData.diaChiGiaoHang.tenQuan || '',
              tenTinh: orderData.diaChiGiaoHang.tenTinh || '',
              tenNguoiNhan: orderData.diaChiGiaoHang.tenNguoiNhan || '',
              soDienThoai: orderData.diaChiGiaoHang.soDienThoai || ''
            } : null,
            // ✅ THÊM: Thông tin vận chuyển
            thongTinVanChuyen: orderData.thongTinVanChuyen ? {
              maVanDon: orderData.thongTinVanChuyen.maVanDon || orderData.thongTinVanChuyen.maVanDon,
              donViVanChuyen: orderData.thongTinVanChuyen.donViVanChuyen || orderData.thongTinVanChuyen.donViVanChuyen,
              ngayGiaoDuKien: orderData.thongTinVanChuyen.ngayGiaoDuKien || orderData.thongTinVanChuyen.ngayGiaoDuKien,
              ngayGuiHang: orderData.thongTinVanChuyen.ngayGuiHang || orderData.thongTinVanChuyen.ngayGuiHang,
              trangThaiGHN: orderData.thongTinVanChuyen.trangThaiGHN || orderData.thongTinVanChuyen.trangThaiGHN
            } : null,
            // ✅ THÊM: Lịch sử trạng thái đơn hàng
            lichSuTrangThai: orderData.lichSuTrangThai ? orderData.lichSuTrangThai.map(item => ({
              id: item.id || item.ID,
              trangThaiCu: item.trangThaiCu || item.TrangThaiCu,
              trangThaiMoi: item.trangThaiMoi || item.TrangThaiMoi,
              nguoiThayDoi: item.nguoiThayDoi || item.NguoiThayDoi,
              lyDo: item.lyDo || item.LyDo,
              ngayThayDoi: item.ngayThayDoi || item.NgayThayDoi
            })) : [],
            maVanDon: orderData.maVanDon || orderData.maVanDon || orderData.thongTinVanChuyen?.maVanDon,
            tongSoLuongSanPham: orderData.tongSoLuongSanPham || 0,
            soLoaiSanPham: orderData.soLoaiSanPham || 0
          };

          console.log('✅ Normalized order:', normalizedOrder);
          setOrder(normalizedOrder);
        }
      } else if (isPublicRoute && orderCode) {
        // Guest user: Gọi API public bằng orderCode
        console.log('👤 Guest user - Lấy đơn hàng công khai:', orderCode);
        response = await orderService.getOrderByCode(orderCode);

        if (response.success) {
          const orderData = response.data.hoaDon || response.data;
          // ✅ THÊM: Map lichSuTrangThai nếu có
          if (orderData.lichSuTrangThai) {
            orderData.lichSuTrangThai = orderData.lichSuTrangThai.map(item => ({
              id: item.id || item.ID,
              trangThaiCu: item.trangThaiCu || item.TrangThaiCu,
              trangThaiMoi: item.trangThaiMoi || item.TrangThaiMoi,
              nguoiThayDoi: item.nguoiThayDoi || item.NguoiThayDoi,
              lyDo: item.lyDo || item.LyDo,
              ngayThayDoi: item.ngayThayDoi || item.NgayThayDoi
            }));
          }
          setOrder(orderData);
        }
      } else if (id) {
        // Logged-in user: Gọi API cần token bằng ID
        if (!user) {
          showToast('Vui lòng đăng nhập để xem đơn hàng', 'warning');
          setTimeout(() => navigate('/login'), 1500);
          return;
        }
        console.log('🔐 User đã đăng nhập - Lấy đơn hàng:', id);
        response = await orderService.getOrderById(id);

        if (response.success) {
          const orderData = response.data.hoaDon || response.data;
          // ✅ THÊM: Map lichSuTrangThai nếu có
          if (orderData.lichSuTrangThai) {
            orderData.lichSuTrangThai = orderData.lichSuTrangThai.map(item => ({
              id: item.id || item.ID,
              trangThaiCu: item.trangThaiCu || item.TrangThaiCu,
              trangThaiMoi: item.trangThaiMoi || item.TrangThaiMoi,
              nguoiThayDoi: item.nguoiThayDoi || item.NguoiThayDoi,
              lyDo: item.lyDo || item.LyDo,
              ngayThayDoi: item.ngayThayDoi || item.NgayThayDoi
            }));
          }
          setOrder(orderData);
        }
      } else {
        throw new Error('Thiếu thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      showToast(error.message || 'Không thể tải chi tiết đơn hàng', 'error');
      setTimeout(() => {
        if (isPublicRoute) {
          navigate('/');
        } else {
          navigate('/orders');
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleCancelOrder = async () => {
    try {
      setCanceling(true);

      // ✅ Sử dụng orderService thay vì cancelOrder API
      const response = await orderService.cancelOrder(order.id, 'Khách hàng yêu cầu hủy');

      if (response.success) {
        showToast(`Đã hủy đơn hàng ${order.maHD} thành công`, 'success');
        setTimeout(() => {
          loadOrderDetail();
        }, 1500);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      showToast(error.message || 'Không thể hủy đơn hàng', 'error');
    } finally {
      setCanceling(false);
      setShowCancelConfirm(false);
    }
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      'Chờ xử lý': 'warning',
      'Chờ thanh toán': 'info',
      'Đang xử lý': 'primary',
      'Đang giao': 'info',
      'Đã giao': 'success',
      'Hoàn thành': 'success',
      'Đã hủy': 'danger',
    };
    return statusMap[status] || 'secondary';
  };

  const canCancelOrder = (status) => {
    return ['Chờ xử lý', 'Chờ thanh toán'].includes(status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Helper function để format giá tiền an toàn
  const formatPrice = (price) => {
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) return '0 ₫';
      return numPrice.toLocaleString('vi-VN') + ' ₫';
    } catch (error) {
      console.error('Error formatting price:', error, price);
      return '0 ₫';
    }
  };

  const Layout = isStaffView ? AdminLayout : MainLayout;
  const backUrl = isStaffView ? '/staff/orders' : (isPublicRoute ? '/order-lookup' : '/orders');

  if (loading) {
    return (
      <Layout isStaffView={isStaffView}>
        <Loading text="Đang tải chi tiết đơn hàng..." fullScreen />
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout isStaffView={isStaffView}>
        <div className="container-cute py-16 text-center">
          <div className="text-8xl mb-6">😢</div>
          <h2 className="text-3xl font-display font-bold text-gray-700 mb-4">
            Không tìm thấy đơn hàng
          </h2>
          <Button
            variant="primary"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate(backUrl)}
          >
            {isPublicRoute ? 'Tra cứu đơn hàng khác' : 'Quay lại danh sách đơn hàng'}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isStaffView={isStaffView}>
      <div className="container-cute py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(backUrl)}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{isPublicRoute ? 'Tra cứu đơn hàng khác' : 'Quay lại danh sách đơn hàng'}</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-rose-50 rounded-bubble p-6 mb-6 border-2 border-primary-100 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-2">
                Chi Tiết Đơn Hàng #{order.maHD}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>{formatDate(order.ngayLap)}</span>
              </div>
            </div>
            <Badge variant={getStatusVariant(order.trangThai)} size="lg">
              {order.trangThai}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <OrderStatusTimeline
              currentStatus={order.trangThai}
              lichSuTrangThai={order.lichSuTrangThai || []}
              order={{
                ...order,
                maVanDon: order.thongTinVanChuyen?.maVanDon || order.maVanDon || order.MaVanDon,
                thongTinVanChuyen: order.thongTinVanChuyen || {
                  maVanDon: order.maVanDon || order.MaVanDon,
                  donViVanChuyen: order.donViVanChuyen || order.DonViVanChuyen,
                  ngayGiaoDuKien: order.ngayGiaoDuKien || order.NgayGiaoDuKien
                }
              }}
            />

            {/* Customer Info */}
            <div className="bg-white rounded-cute p-6 border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={24} className="text-primary-500" />
                Thông Tin Người Nhận
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-semibold text-gray-800">
                      {order.diaChiGiaoHang?.tenNguoiNhan || order.khachHang.hoTen}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-semibold text-gray-800">
                      {order.diaChiGiaoHang?.soDienThoai || order.khachHang.dienThoai || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">{order.khachHang.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                    {/* ✅ FIX: Lấy địa chỉ từ order.diaChiGiaoHang */}
                    <p className="font-semibold text-gray-800">
                      {order.diaChiGiaoHang ? (
                        <>
                          {order.diaChiGiaoHang.diaChiChiTiet && `${order.diaChiGiaoHang.diaChiChiTiet}, `}
                          {order.diaChiGiaoHang.tenPhuong && `${order.diaChiGiaoHang.tenPhuong}, `}
                          {order.diaChiGiaoHang.tenQuan && `${order.diaChiGiaoHang.tenQuan}, `}
                          {order.diaChiGiaoHang.tenTinh || ''}
                        </>
                      ) : (
                        'Chưa cập nhật địa chỉ'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-cute p-6 border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={24} className="text-primary-500" />
                Danh Sách Sản Phẩm ({order.chiTiet.length})
              </h3>
              <div className="space-y-4">
                {order.chiTiet.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 rounded-cute border-2 border-primary-100 hover:shadow-soft transition-all ${index !== order.chiTiet.length - 1 ? 'mb-3' : ''
                      }`}
                  >
                    <img
                      src={buildImageUrl(item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL || item.hinhAnh)}
                      alt={item.sanPham?.ten || item.tenSanPham || 'Sản phẩm'}
                      className="w-20 h-20 object-cover rounded-cute border-2 border-primary-100 flex-shrink-0"
                      onError={handleImageError}
                    />
                    <div className="flex-grow">
                      <Link
                        to={`/products/${item.sanPham?.id || item.sanPhamId || item.SanPhamID || item.sanPhamID}`}
                        className="font-bold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {item.sanPham?.ten || item.sanPham?.Ten || item.tenSanPham || 'Sản phẩm không xác định'}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Số lượng: <strong>{item.soLuong || item.SoLuong || 0}</strong></span>
                        <span>Đơn giá: <strong>{formatPrice(item.donGia || item.DonGia || item.sanPham?.giaBan || 0)}</strong></span>
                      </div>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-red-600">
                          Thành tiền: {formatPrice(item.thanhTien || item.ThanhTien || ((item.soLuong || item.SoLuong || 0) * (item.donGia || item.DonGia || item.sanPham?.giaBan || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GHN Tracking - Hiển thị nếu đơn hàng đã có mã vận đơn */}
            {(order.thongTinVanChuyen?.maVanDon || order.maVanDon) && (
              <GHNTracking
                orderId={order.id || order.ID}
                orderCode={order.maHD || order.MaHD}
              />
            )}

            {/* Note */}
            {order.ghiChu && (
              <div className="bg-gradient-to-br from-cream-50 to-primary-50 rounded-cute p-6 border-2 border-primary-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={24} className="text-primary-500" />
                  Ghi Chú
                </h3>
                <p className="text-gray-700 leading-relaxed">{order.ghiChu || order.GhiChu}</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-cute p-6 border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={24} className="text-primary-500" />
                Phương Thức Thanh Toán
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="md">
                  {order.phuongThucThanhToan?.ten || order.phuongThucThanhToan?.Ten || 'Chưa xác định'}
                </Badge>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-primary-50 to-rose-50 rounded-cute p-6 border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-primary-500" />
                Tóm Tắt Đơn Hàng
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng số lượng:</span>
                  <span className="font-semibold text-gray-800">
                    {order.chiTiet.reduce((sum, item) => sum + (item.soLuong || item.SoLuong || 0), 0)} sản phẩm
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-primary-200">
                  <span className="text-lg font-bold text-gray-800">Tổng tiền:</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatPrice(order.tongTien || order.thanhTien || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
};

export default OrderDetailPage;
