import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as orderApi from '../../api/order.api';
import { formatCurrency, formatDate } from '../../utils/format';
import { Button, Loading, ErrorMessage } from '../../components/common';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, currentPage, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrderHistory(currentPage, 10);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading orders:', error);
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ xử lý': { className: 'status-pending', icon: '⏳' },
      'Đang xử lý': { className: 'status-processing', icon: '📦' },
      'Đang giao': { className: 'status-shipping', icon: '🚚' },
      'Đã giao': { className: 'status-delivered', icon: '✅' },
      'Đã hủy': { className: 'status-cancelled', icon: '❌' },
    };

    const config = statusConfig[status] || { className: 'status-default', icon: '📋' };
    
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon} {status}
      </span>
    );
  };

  const handleViewDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await orderApi.cancelOrder(orderId, 'Khách hàng hủy đơn');
      setMessage('Đã hủy đơn hàng thành công');
      setMessageType('success');
      loadOrders();
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải lịch sử đơn hàng..." />;
  }

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="page-header">
          <h1>📜 Lịch sử đơn hàng</h1>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            ← Về trang chủ
          </Button>
        </div>

        {message && (
          <ErrorMessage
            message={message}
            type={messageType}
            onClose={() => setMessage('')}
          />
        )}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>Chưa có đơn hàng nào</h2>
            <p>Hãy mua sắm và tạo đơn hàng đầu tiên của bạn</p>
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
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Đơn hàng #{order.maHD}</h3>
                      <p className="order-date">
                        📅 {formatDate(order.ngayLap)}
                      </p>
                    </div>
                    <div className="order-status">
                      {getStatusBadge(order.trangThai)}
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-items">
                      {order.items && order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="order-item-preview">
                          <img 
                            src={item.hinhAnh || '/placeholder.jpg'} 
                            alt={item.tenSanPham}
                          />
                          <span>{item.tenSanPham}</span>
                          <span className="item-qty">x{item.soLuong}</span>
                        </div>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <p className="more-items">
                          +{order.items.length - 3} sản phẩm khác
                        </p>
                      )}
                    </div>

                    <div className="order-total">
                      <span>Tổng tiền:</span>
                      <strong>{formatCurrency(order.tongTien)}</strong>
                    </div>
                  </div>

                  <div className="order-footer">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleViewDetail(order.id)}
                    >
                      👁️ Xem chi tiết
                    </Button>
                    
                    {order.trangThai === 'Chờ xử lý' && (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        ❌ Hủy đơn
                      </Button>
                    )}

                    {order.trangThai === 'Đã giao' && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate('/products')}
                      >
                        🔄 Mua lại
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="secondary"
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Trước
                </Button>
                <span className="page-info">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
