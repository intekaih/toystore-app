// src/components/OrderTable.jsx
import React, { useState } from 'react';
import '../styles/OrderTable.css';

const OrderTable = ({ orders, onUpdateStatus, loading }) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy class cho badge trạng thái
  const getStatusClass = (status) => {
    const statusMap = {
      'Chờ xử lý': 'pending',
      'Đang giao': 'shipping',
      'Đã giao': 'delivered',
      'Hoàn thành': 'completed',
      'Đã hủy': 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  // Lấy trạng thái kế tiếp
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Chờ xử lý': 'Đang giao',
      'Đang giao': 'Đã giao',
      'Đã giao': 'Hoàn thành'
    };
    return statusFlow[currentStatus];
  };

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = (order) => {
    const nextStatus = getNextStatus(order.trangThai);
    if (!nextStatus) {
      alert('Đơn hàng đã ở trạng thái cuối cùng hoặc đã bị hủy');
      return;
    }

    const confirmMessage = `Bạn có chắc muốn chuyển đơn hàng ${order.maHD}\ntừ "${order.trangThai}" sang "${nextStatus}"?`;
    if (window.confirm(confirmMessage)) {
      onUpdateStatus(order.id, nextStatus);
    }
  };

  // Toggle xem chi tiết đơn hàng
  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="order-table-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-table-empty">
        <div className="empty-icon">📦</div>
        <h3>Không có đơn hàng nào</h3>
        <p>Chưa có đơn hàng nào trong hệ thống</p>
      </div>
    );
  }

  return (
    <div className="order-table-container">
      <table className="order-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr 
                className={expandedOrderId === order.id ? 'expanded' : ''}
                onClick={() => toggleExpand(order.id)}
              >
                <td className="order-id-col">
                  <div className="order-id">
                    <span className="expand-icon">
                      {expandedOrderId === order.id ? '▼' : '▶'}
                    </span>
                    <strong>{order.maHD}</strong>
                  </div>
                </td>

                <td className="customer-col">
                  <div className="customer-info">
                    <div className="customer-name">{order.khachHang.hoTen}</div>
                    <div className="customer-contact">
                      📞 {order.khachHang.dienThoai}
                    </div>
                  </div>
                </td>

                <td className="date-col">
                  {formatDate(order.ngayLap)}
                </td>

                <td className="price-col">
                  <span className="total-price">{formatPrice(order.tongTien)}</span>
                  <div className="order-items-count">
                    {order.tongSoLuongSanPham} sản phẩm
                  </div>
                </td>

                <td className="status-col">
                  <span className={`status-badge ${getStatusClass(order.trangThai)}`}>
                    {order.trangThai}
                  </span>
                </td>

                <td className="payment-col">
                  <span className="payment-method">
                    {order.phuongThucThanhToan.ten}
                  </span>
                </td>

                <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                  {getNextStatus(order.trangThai) ? (
                    <button
                      className="btn-update-status"
                      onClick={() => handleUpdateStatus(order)}
                      title={`Chuyển sang: ${getNextStatus(order.trangThai)}`}
                    >
                      ▶️ {getNextStatus(order.trangThai)}
                    </button>
                  ) : (
                    <span className="status-final">
                      {order.trangThai === 'Đã hủy' ? '❌' : '✅'} Kết thúc
                    </span>
                  )}
                </td>
              </tr>

              {/* Chi tiết đơn hàng khi expand */}
              {expandedOrderId === order.id && (
                <tr className="order-detail-row">
                  <td colSpan="7">
                    <div className="order-detail">
                      <div className="detail-section">
                        <h4>📋 Thông tin chi tiết</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{order.khachHang.email}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Địa chỉ:</span>
                            <span className="detail-value">{order.khachHang.diaChi}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Số loại sản phẩm:</span>
                            <span className="detail-value">{order.soLoaiSanPham}</span>
                          </div>
                          {order.ghiChu && (
                            <div className="detail-item full-width">
                              <span className="detail-label">Ghi chú:</span>
                              <span className="detail-value">{order.ghiChu}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
