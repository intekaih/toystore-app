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
          
          // ✅ Normalize dữ liệu để đảm bảo format nhất quán
          const normalizedOrder = {
            ...orderData,
            // ✅ Normalize địa chỉ giao hàng: Backend trả về tinhThanh, quanHuyen, phuongXa
            diaChiGiaoHang: orderData.diaChiGiaoHang ? {
              id: orderData.diaChiGiaoHang.id,
              diaChiChiTiet: orderData.diaChiGiaoHang.diaChiChiTiet || '',
              tenPhuong: orderData.diaChiGiaoHang.phuongXa || orderData.diaChiGiaoHang.tenPhuong || '',
              tenQuan: orderData.diaChiGiaoHang.quanHuyen || orderData.diaChiGiaoHang.tenQuan || '',
              tenTinh: orderData.diaChiGiaoHang.tinhThanh || orderData.diaChiGiaoHang.tenTinh || '',
              tenNguoiNhan: orderData.diaChiGiaoHang.tenNguoiNhan || '',
              soDienThoai: orderData.diaChiGiaoHang.soDienThoai || ''
            } : null,
            // ✅ Normalize chi tiết sản phẩm: Backend trả về hinhAnh
            chiTiet: (orderData.chiTiet || []).map(item => ({
              id: item.id,
              soLuong: item.soLuong || item.SoLuong || 0,
              donGia: item.donGia || item.DonGia || 0,
              thanhTien: item.thanhTien || item.ThanhTien || 0,
              sanPham: {
                id: item.sanPham?.id,
                ten: item.sanPham?.ten || item.sanPham?.Ten || 'Sản phẩm không xác định',
                giaBan: item.sanPham?.giaBan || item.donGia || 0,
                hinhAnhUrl: item.sanPham?.hinhAnh || item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL || '',
                loaiSP: item.sanPham?.loaiSp || item.sanPham?.loaiSP || {}
              }
            })),
          };
          
          console.log('✅ Normalized order (guest):', normalizedOrder);
          setOrder(normalizedOrder);
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
          
          // ✅ Normalize dữ liệu để đảm bảo format nhất quán
          const normalizedOrder = {
            ...orderData,
            // ✅ Normalize địa chỉ giao hàng: Backend trả về tinhThanh, quanHuyen, phuongXa
            diaChiGiaoHang: orderData.diaChiGiaoHang ? {
              id: orderData.diaChiGiaoHang.id,
              diaChiChiTiet: orderData.diaChiGiaoHang.diaChiChiTiet || '',
              tenPhuong: orderData.diaChiGiaoHang.phuongXa || orderData.diaChiGiaoHang.tenPhuong || '',
              tenQuan: orderData.diaChiGiaoHang.quanHuyen || orderData.diaChiGiaoHang.tenQuan || '',
              tenTinh: orderData.diaChiGiaoHang.tinhThanh || orderData.diaChiGiaoHang.tenTinh || '',
              tenNguoiNhan: orderData.diaChiGiaoHang.tenNguoiNhan || '',
              soDienThoai: orderData.diaChiGiaoHang.soDienThoai || ''
            } : null,
            // ✅ Normalize chi tiết sản phẩm: Backend trả về hinhAnh
            chiTiet: (orderData.chiTiet || []).map(item => ({
              id: item.id,
              soLuong: item.soLuong || item.SoLuong || 0,
              donGia: item.donGia || item.DonGia || 0,
              thanhTien: item.thanhTien || item.ThanhTien || 0,
              sanPham: {
                id: item.sanPham?.id,
                ten: item.sanPham?.ten || item.sanPham?.Ten || 'Sản phẩm không xác định',
                giaBan: item.sanPham?.giaBan || item.donGia || 0,
                hinhAnhUrl: item.sanPham?.hinhAnh || item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL || '',
                loaiSP: item.sanPham?.loaiSp || item.sanPham?.loaiSP || {}
              }
            })),
          };
          
          console.log('✅ Normalized order (user):', normalizedOrder);
          setOrder(normalizedOrder);
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
        <div className="bg-gradient-to-r from-primary-50 to-rose-50 rounded-bubble py-3 px-6 mb-6 border-2 border-primary-100 shadow-soft">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Info */}
          <div className="space-y-6">
            {/* Order Status Timeline */}
            <OrderStatusTimeline
              currentStatus={order.trangThai}
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

            {/* GHN Tracking - Hiển thị nếu đơn hàng đã có mã vận đơn */}
            {(order.thongTinVanChuyen?.maVanDon || order.maVanDon) && (
              <GHNTracking
                orderId={order.id || order.ID}
                orderCode={order.maHD || order.MaHD}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Products List */}
            <div className="bg-white rounded-cute p-6 border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={24} className="text-primary-500" />
                  <span>Danh Sách Sản Phẩm ({order.chiTiet.length})</span>
                </div>
                <Badge variant="info" size="md">
                  {order.phuongThucThanhToan?.ten || order.phuongThucThanhToan?.Ten || 'Chưa xác định'}
                </Badge>
              </h3>
              <div className="space-y-4">
                {order.chiTiet.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 rounded-cute border-2 border-primary-100 hover:shadow-soft transition-all ${index !== order.chiTiet.length - 1 ? 'mb-3' : ''
                      }`}
                  >
                    <img
                      src={buildImageUrl(item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL || item.hinhAnh || '')}
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
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                        <span>Số lượng: <strong>{item.soLuong || item.SoLuong || 0}</strong></span>
                        <span>Đơn giá: <strong>{formatPrice(item.donGia || item.DonGia || item.sanPham?.giaBan || 0)}</strong></span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Thành tiền:</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(item.thanhTien || item.ThanhTien || ((item.soLuong || item.SoLuong || 0) * (item.donGia || item.DonGia || item.sanPham?.giaBan || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chi phí và tổng tiền */}
              <div className="mt-6 pt-4 border-t-2 border-primary-200 space-y-3">
                {/* Tạm tính */}
                <div className="flex justify-between items-center text-gray-700">
                  <span className="flex items-center gap-2">
                    <span>📦</span>
                    <span>Tạm tính:</span>
                  </span>
                  <span className="font-semibold">
                    {formatPrice(
                      order.chiTiet.reduce((sum, item) => 
                        sum + (item.thanhTien || item.ThanhTien || ((item.soLuong || item.SoLuong || 0) * (item.donGia || item.DonGia || 0))), 
                        0
                      )
                    )}
                  </span>
                </div>

                {/* Phí vận chuyển */}
                {(order.priceBreakdown?.shipping?.fee || order.tienShip || order.TienShip) && (
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-2">
                      <span>🚚</span>
                      <span>Phí vận chuyển:</span>
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(
                        order.priceBreakdown?.shipping?.fee || 
                        parseFloat(order.tienShip || order.TienShip || 0)
                      )}
                    </span>
                  </div>
                )}

                {/* VAT */}
                {(order.priceBreakdown?.vat?.amount || order.tienVAT || order.TienVAT) && (
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-2">
                      <span>💰</span>
                      <span>VAT ({order.priceBreakdown?.vat?.rate ? `${(order.priceBreakdown.vat.rate * 100).toFixed(0)}%` : '10%'}):</span>
                    </span>
                    <span className="font-semibold text-blue-600">
                      {formatPrice(
                        order.priceBreakdown?.vat?.amount || 
                        parseFloat(order.tienVAT || order.TienVAT || 0)
                      )}
                    </span>
                  </div>
                )}

                {/* Giảm giá */}
                {(order.priceBreakdown?.voucher?.discountAmount || order.giamGia || order.GiamGia) && (
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-2">
                      <span>🎁</span>
                      <span>Giảm giá:</span>
                    </span>
                    <span className="font-semibold text-red-600">
                      -{formatPrice(
                        order.priceBreakdown?.voucher?.discountAmount || 
                        parseFloat(order.giamGia || order.GiamGia || 0)
                      )}
                    </span>
                  </div>
                )}

                {/* Tổng cộng */}
                <div className="pt-3 border-t-2 border-primary-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(
                        order.tongTien || 
                        order.thanhTien || 
                        order.priceBreakdown?.thanhTien || 
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-cute p-6 border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={24} className="text-primary-500" />
                Thông Tin Người Nhận
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User size={18} className="text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-500">Họ tên</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {order.diaChiGiaoHang?.tenNguoiNhan || order.khachHang.hoTen}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={18} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {order.diaChiGiaoHang?.soDienThoai || order.khachHang.dienThoai || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={18} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                    <p className="font-semibold text-gray-800">{order.khachHang.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  </div>
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
