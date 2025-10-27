import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderDetail, cancelOrder } from '../api/orderApi';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading, Modal } from '../components/ui';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Calendar, CreditCard, FileText, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!user) {
      showToast('Vui lòng đăng nhập để xem đơn hàng', 'warning');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    loadOrderDetail();
  }, [user, navigate, id]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(id);

      if (response.success) {
        console.log('📦 Dữ liệu đơn hàng từ backend:', response.data.hoaDon);
        setOrder(response.data.hoaDon);
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      showToast(error.message || 'Không thể tải chi tiết đơn hàng', 'error');
      setTimeout(() => navigate('/orders'), 2000);
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
      const response = await cancelOrder(order.id);

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
      'Đang giao hàng': 'info',
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

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải chi tiết đơn hàng..." fullScreen />
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container-cute py-16 text-center">
          <div className="text-8xl mb-6">😢</div>
          <h2 className="text-3xl font-display font-bold text-gray-700 mb-4">
            Không tìm thấy đơn hàng
          </h2>
          <Button 
            variant="primary"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/orders')}
          >
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại danh sách đơn hàng</span>
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
                    <p className="font-semibold text-gray-800">{order.khachHang.hoTen}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-semibold text-gray-800">{order.khachHang.dienThoai || 'Chưa cập nhật'}</p>
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
                    <p className="font-semibold text-gray-800">{order.khachHang.diaChi || 'Chưa cập nhật'}</p>
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
                    className={`flex gap-4 p-4 rounded-cute border-2 border-primary-100 hover:shadow-soft transition-all ${
                      index !== order.chiTiet.length - 1 ? 'mb-3' : ''
                    }`}
                  >
                    <img
                      src={item.hinhAnh || '/barbie.jpg'}
                      alt={item.tenSanPham}
                      className="w-20 h-20 object-cover rounded-cute border-2 border-primary-100 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/barbie.jpg';
                      }}
                    />
                    <div className="flex-grow">
                      <Link 
                        to={`/products/${item.sanPhamId}`}
                        className="font-bold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {item.tenSanPham}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-primary-600 font-semibold">
                          {item.donGia.toLocaleString('vi-VN')} ₫
                        </span>
                        <span className="text-gray-500">×{item.soLuong}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gradient-primary">
                        {item.thanhTien.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            {order.ghiChu && (
              <div className="bg-gradient-to-br from-cream-50 to-primary-50 rounded-cute p-6 border-2 border-primary-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={24} className="text-primary-500" />
                  Ghi Chú
                </h3>
                <p className="text-gray-700 leading-relaxed">{order.ghiChu}</p>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Payment Info */}
            <div className="bg-white rounded-cute p-6 border-2 border-primary-100 shadow-soft sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={24} className="text-primary-500" />
                Thanh Toán
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phương thức:</span>
                  <Badge variant="primary">{order.phuongThucThanhToan.ten}</Badge>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-gradient-primary">
                    {order.tongTien.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            {/* Cancel Action */}
            {canCancelOrder(order.trangThai) && (
              <div className="bg-rose-50 rounded-cute p-6 border-2 border-rose-200">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle size={20} className="text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Hủy đơn hàng</h4>
                    <p className="text-sm text-gray-600">Bạn có thể hủy đơn hàng này vì đang ở trạng thái "{order.trangThai}"</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={canceling}
                  loading={canceling}
                >
                  {canceling ? 'Đang hủy...' : '🚫 Hủy đơn hàng'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <Modal
          isOpen={showCancelConfirm}
          onClose={() => !canceling && setShowCancelConfirm(false)}
          title="⚠️ Xác Nhận Hủy Đơn Hàng"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Bạn có chắc chắn muốn hủy đơn hàng{' '}
              <strong className="text-primary-600">#{order.maHD}</strong>?
            </p>
            <p className="text-sm text-gray-500 bg-cream-50 p-3 rounded-cute border border-primary-100">
              💡 Số lượng sản phẩm sẽ được hoàn lại vào kho.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowCancelConfirm(false)}
                disabled={canceling}
              >
                Không
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleCancelOrder}
                disabled={canceling}
                loading={canceling}
              >
                {canceling ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </MainLayout>
  );
};

export default OrderDetailPage;
