import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderHistory, cancelOrder } from '../api/orderApi';
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag, FileText } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading, Modal } from '../components/ui';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';

const OrderHistoryPage = () => {
  // Backend API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Build full image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    
    // Nếu đã là full URL (http/https)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /uploads/
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Nếu chỉ là filename
    if (!imagePath.startsWith('/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    
    return '/barbie.jpg';
  };
  
  // Handle image error
  const handleImageError = (e) => {
    console.warn('❌ Lỗi load ảnh trong đơn hàng:', e.target.src);
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
    }
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!user) {
      showToast('Vui lòng đăng nhập để xem đơn hàng', 'warning');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    loadOrders();
  }, [user, navigate, currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrderHistory(
        currentPage,
        ordersPerPage,
        statusFilter || null
      );

      if (response.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalOrders(response.data.pagination.totalOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast(error.message || 'Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleCancelOrder = async (orderId, orderCode) => {
    try {
      setCancelingOrderId(orderId);
      const response = await cancelOrder(orderId);

      if (response.success) {
        showToast(`Đã hủy đơn hàng ${orderCode} thành công`, 'success');
        loadOrders();
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      showToast(error.message || 'Không thể hủy đơn hàng', 'error');
    } finally {
      setCancelingOrderId(null);
      setShowCancelConfirm(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Chờ xử lý': { variant: 'warning', icon: '🕐' },
      'Chờ thanh toán': { variant: 'info', icon: '💳' },
      'Đang xử lý': { variant: 'primary', icon: '⚙️' },
      'Đang giao hàng': { variant: 'info', icon: '🚚' },
      'Đã giao': { variant: 'success', icon: '✅' },
      'Hoàn thành': { variant: 'success', icon: '✅' },
      'Đã hủy': { variant: 'danger', icon: '❌' },
    };
    return statusMap[status] || { variant: 'secondary', icon: '📦' };
  };

  const canCancelOrder = (status) => {
    return ['Chờ xử lý', 'Chờ thanh toán'].includes(status);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (loading && orders.length === 0) {
    return (
      <MainLayout>
        <Loading text="Đang tải đơn hàng..." fullScreen />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gradient-primary mb-2 flex items-center gap-3">
            <Package size={40} />
            Lịch Sử Đơn Hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các đơn hàng của bạn
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={statusFilter === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('')}
          >
            Tất cả ({totalOrders})
          </Button>
          <Button
            variant={statusFilter === 'Chờ xử lý' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('Chờ xử lý')}
            icon={<Clock size={16} />}
          >
            Chờ xử lý
          </Button>
          <Button
            variant={statusFilter === 'Đang giao hàng' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('Đang giao hàng')}
            icon={<Truck size={16} />}
          >
            Đang giao
          </Button>
          <Button
            variant={statusFilter === 'Hoàn thành' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('Hoàn thành')}
            icon={<CheckCircle size={16} />}
          >
            Hoàn thành
          </Button>
          <Button
            variant={statusFilter === 'Đã hủy' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('Đã hủy')}
            icon={<XCircle size={16} />}
          >
            Đã hủy
          </Button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce-soft">📭</div>
            <h2 className="text-3xl font-display font-bold text-gray-700 mb-4">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-600 mb-6">
              {statusFilter
                ? `Không có đơn hàng nào với trạng thái "${statusFilter}"`
                : 'Bạn chưa có đơn hàng nào'}
            </p>
            <Button 
              variant="primary"
              size="lg"
              icon={<ShoppingBag size={20} />}
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.trangThai);
                
                return (
                  <div key={order.id} className="bg-white rounded-bubble shadow-soft border-2 border-primary-100 overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-rose-50 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Đơn hàng #{order.maHD}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock size={16} />
                          {new Date(order.ngayLap).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <Badge variant={statusBadge.variant} size="lg">
                        {statusBadge.icon} {order.trangThai}
                      </Badge>
                    </div>

                    {/* Order Products */}
                    <div className="p-4 space-y-3">
                      {order.sanPhams.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex gap-4 items-center">
                          <img
                            src={buildImageUrl(product.hinhAnh)}
                            alt={product.tenSanPham}
                            className="w-16 h-16 object-cover rounded-cute flex-shrink-0"
                            onError={handleImageError}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 line-clamp-1">
                              {product.tenSanPham}
                            </div>
                            <div className="text-sm text-gray-600">
                              x{product.soLuong}
                            </div>
                          </div>
                          <div className="font-bold text-primary-600">
                            {product.thanhTien.toLocaleString('vi-VN')} ₫
                          </div>
                        </div>
                      ))}
                      {order.sanPhams.length > 3 && (
                        <div className="text-sm text-primary-600 font-medium text-center py-2 bg-primary-50 rounded-cute">
                          +{order.sanPhams.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-gray-700 mr-2">Tổng tiền:</span>
                        <span className="text-2xl font-bold text-gradient-primary">
                          {order.tongTien.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FileText size={16} />}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Chi tiết
                        </Button>
                        {canCancelOrder(order.trangThai) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowCancelConfirm({
                              orderId: order.id,
                              orderCode: order.maHD
                            })}
                            disabled={cancelingOrderId === order.id}
                            loading={cancelingOrderId === order.id}
                            icon={<XCircle size={16} />}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!showCancelConfirm}
        onClose={() => setShowCancelConfirm(null)}
        title="⚠️ Xác Nhận Hủy Đơn Hàng"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn hủy đơn hàng{' '}
            <strong className="text-primary-600">#{showCancelConfirm?.orderCode}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Số lượng sản phẩm sẽ được hoàn lại vào kho.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(null)}
            >
              Không
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                handleCancelOrder(
                  showCancelConfirm.orderId,
                  showCancelConfirm.orderCode
                )
              }
            >
              Hủy đơn hàng
            </Button>
          </div>
        </div>
      </Modal>

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

export default OrderHistoryPage;
