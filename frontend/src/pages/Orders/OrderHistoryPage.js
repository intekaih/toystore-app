import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOrderHistory, cancelOrder } from '../../api/order.api';
import { formatCurrency } from '../../utils/format';
import { Button, Loading, ErrorMessage, Pagination } from '../../components/common';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'Chờ xử lý', label: 'Chờ xử lý' },
    { value: 'Đang giao', label: 'Đang giao' },
    { value: 'Đã giao', label: 'Đã giao' },
    { value: 'Đã hủy', label: 'Đã hủy' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [user, navigate, currentPage, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      console.log('📦 Loading orders - Page:', currentPage, 'Status:', selectedStatus);

      const response = await getOrderHistory({
        page: currentPage,
        limit: 10,
        trangThai: selectedStatus || undefined
      });

      console.log('✅ Orders response:', response);

      // ✅ Kiểm tra cấu trúc response
      if (response.success) {
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalOrders(response.data.pagination?.totalOrders || 0);
        } else {
          // Nếu không có data, set empty array
          setOrders([]);
          setTotalPages(1);
          setTotalOrders(0);
        }
      } else {
        // API trả về success: false
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
        showMessage(response.message || 'Không thể tải danh sách đơn hàng', 'error');
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      showMessage(error.message || 'Không thể tải danh sách đơn hàng', 'error');
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, orderCode) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng ${orderCode}?`)) {
      return;
    }

    try {
      setLoading(true);
      await cancelOrder(orderId);
      showMessage('Đã hủy đơn hàng thành công', 'success');
      
      // Reload orders
      await loadOrders();
    } catch (error) {
      console.error('❌ Error canceling order:', error);
      showMessage(error.message || 'Không thể hủy đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (orderId) => {
    // Navigate to order detail page (nếu có)
    console.log('View order detail:', orderId);
    // navigate(`/orders/${orderId}`);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset về trang 1 khi đổi filter
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chờ xử lý': 'status-pending',
      'Đang giao': 'status-shipping',
      'Đã giao': 'status-delivered',
      'Đã hủy': 'status-cancelled',
    };
    return statusMap[status] || 'status-default';
  };

  if (loading && orders.length === 0) {
    return <Loading fullScreen text="Đang tải lịch sử đơn hàng..." />;
  }

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="page-header">
          <h1>📋 Lịch sử đơn hàng</h1>
          <p className="order-count">
            {totalOrders > 0 ? `Tổng ${totalOrders} đơn hàng` : 'Chưa có đơn hàng nào'}
          </p>
        </div>

        {message && (
          <ErrorMessage
            message={message}
            type={messageType}
            onClose={() => setMessage('')}
          />
        )}

        {/* Status Filter */}
        <div className="filter-section">
          <div className="status-filter">
            {statusOptions.map(option => (
              <button
                key={option.value}
                className={`filter-btn ${selectedStatus === option.value ? 'active' : ''}`}
                onClick={() => handleStatusChange(option.value)}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>Không có đơn hàng nào</h2>
            <p>
              {selectedStatus
                ? `Không tìm thấy đơn hàng với trạng thái "${selectedStatus}"`
                : 'Bạn chưa có đơn hàng nào'}
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/products')}
            >
              🛍️ Mua sắm ngay
            </Button>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Đơn hàng #{order.maHD}</h3>
                      <p className="order-date">
                        {new Date(order.ngayLap).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${getStatusClass(order.trangThai)}`}>
                        {order.trangThai}
                      </span>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-products">
                      <h4>Sản phẩm ({order.soLoaiSanPham} loại)</h4>
                      <div className="product-list">
                        {order.sanPhams?.slice(0, 3).map((item) => (
                          <div key={item.id} className="product-item">
                            <div className="product-image">
                              <img
                                src={item.hinhAnh || '/placeholder.jpg'}
                                alt={item.tenSanPham}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzljYTNhZiI+8J+nmDwvdGV4dD48L3N2Zz4=';
                                }}
                              />
                            </div>
                            <div className="product-info">
                              <p className="product-name">{item.tenSanPham}</p>
                              <p className="product-quantity">x{item.soLuong}</p>
                            </div>
                            <div className="product-price">
                              {formatCurrency(item.thanhTien)}
                            </div>
                          </div>
                        ))}
                        {order.soLoaiSanPham > 3 && (
                          <p className="more-products">
                            +{order.soLoaiSanPham - 3} sản phẩm khác
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="detail-row">
                        <span>Tổng số lượng:</span>
                        <strong>{order.tongSoLuongSanPham} sản phẩm</strong>
                      </div>
                      <div className="detail-row">
                        <span>Thanh toán:</span>
                        <span>{order.phuongThucThanhToan?.ten || 'N/A'}</span>
                      </div>
                      <div className="detail-row total">
                        <span>Tổng tiền:</span>
                        <strong className="total-amount">
                          {formatCurrency(order.tongTien)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-actions">
                      {/* <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleViewDetail(order.id)}
                      >
                        👁️ Chi tiết
                      </Button> */}
                      
                      {(order.trangThai === 'Chờ xử lý' || order.trangThai === 'Chờ thanh toán') && (
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleCancelOrder(order.id, order.maHD)}
                          disabled={loading}
                        >
                          ❌ Hủy đơn
                        </Button>
                      )}
                    </div>

                    {order.ghiChu && (
                      <div className="order-note">
                        <strong>Ghi chú:</strong> {order.ghiChu}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
