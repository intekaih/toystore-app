// src/components/OrderTable.jsx
import React, { useState } from 'react';
import { Package, ShoppingBag, Bell, CheckCircle, Phone, User, AlertCircle, ChevronRight, ChevronDown, PlayCircle, XCircle, FileText, PackageCheck, Truck, Box } from 'lucide-react';
import config from '../config';
import { adminService } from '../services';
import staffService from '../services/staffService';
import '../styles/OrderTable.css';

const OrderTable = ({ orders, onUpdateStatus, loading, isStaffView = false }) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // Format giá tiền với error handling
  const formatPrice = (price) => {
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
        console.warn('Invalid price value:', price);
        return '0 ₫';
      }
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(numPrice);
    } catch (error) {
      console.error('Error formatting price:', error, price);
      return '0 ₫';
    }
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

  // ✅ CẬP NHẬT: Luồng trạng thái khớp với backend State Pattern
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Chờ xử lý': 'Đã xác nhận',
      'Đã xác nhận': 'Đang đóng gói', // ✅ Tạo đơn GHN
      'Đang đóng gói': 'Sẵn sàng giao hàng', // ✅ SỬA: Đóng gói xong
      'Sẵn sàng giao hàng': 'Đang giao hàng', // ✅ THÊM: Chờ shipper lấy
      'Đang giao hàng': 'Đã giao hàng',
      'Đã giao hàng': 'Hoàn thành',
      'Giao hàng thất bại': 'Đang giao hàng' // Giao lại
    };
    return statusFlow[currentStatus];
  };

  // ✅ THÊM MỚI: Lấy icon cho từng trạng thái
  const getStatusIcon = (status) => {
    const iconMap = {
      'Chờ xử lý': '⏳',
      'Đã xác nhận': '✅',
      'Đang đóng gói': '📦',
      'Sẵn sàng giao hàng': '✅', // ✅ THÊM
      'Đang giao hàng': '🚚',
      'Đã giao hàng': '✅',
      'Hoàn thành': '🎉',
      'Đã hủy': '❌',
      'Giao hàng thất bại': '⚠️'
    };
    return iconMap[status] || '📋';
  };

  // ✅ THÊM MỚI: Lấy text nút thao tác
  const getActionButtonText = (currentStatus) => {
    const buttonText = {
      'Chờ xử lý': 'Xác nhận',
      'Đã xác nhận': 'Tạo đơn GHN', // ✅ SỬA
      'Đang đóng gói': 'Đóng gói xong', // ✅ SỬA
      'Sẵn sàng giao hàng': 'Shipper đã lấy', // ✅ THÊM (hoặc để GHN webhook tự động)
      'Đang giao hàng': 'Đã giao hàng',
      'Đã giao hàng': 'Hoàn thành',
      'Giao hàng thất bại': 'Giao lại'
    };
    return buttonText[currentStatus];
  };

  // ✅ CẬP NHẬT: Xử lý cập nhật trạng thái với quy trình mới
  const handleUpdateStatus = async (order) => {
    const nextStatus = getNextStatus(order.trangThai);
    if (!nextStatus) {
      alert('Đơn hàng đã ở trạng thái cuối cùng hoặc đã bị hủy');
      return;
    }

    const confirmMessage = `Bạn có chắc muốn chuyển đơn hàng ${order.maHD}\ntừ "${order.trangThai}" sang "${nextStatus}"?`;

    if (window.confirm(confirmMessage)) {
      setProcessingOrderId(order.id);
      try {
        let response;

        // Staff: Đơn giản hóa - chỉ dùng updateOrderStatus
        if (isStaffView) {
          response = await staffService.updateOrderStatus(order.id, {
            trangThai: nextStatus,
            ghiChu: `Chuyển từ "${order.trangThai}" sang "${nextStatus}"`
          });
        } else {
          // Admin: Dùng các method đặc biệt
          switch (order.trangThai) {
            case 'Chờ xử lý':
              response = await adminService.confirmOrder(order.id, { ghiChu: 'Đã kiểm tra đơn hàng' });
              break;
            case 'Đã xác nhận':
              // ✅ Tạo đơn GHN (Đã xác nhận → Đang đóng gói)
              response = await adminService.createShippingOrder(order.id, {
                useGHN: true,
                weight: 500,
                note: `Đơn hàng ${order.maHD} - ToyStore`
              });

              if (response.success) {
                const { maVanDon, printUrl, instructions } = response.data;
                alert(
                  `✅ Đã tạo đơn GHN thành công!\n\n` +
                  `🏷️ Mã vận đơn: ${maVanDon}\n\n` +
                  `📋 Hướng dẫn:\n${instructions.join('\n')}\n\n` +
                  `🔗 Tracking: ${printUrl || 'Không có'}`
                );
              }
              break;
            case 'Đang đóng gói':
              // ✅ Xác nhận đóng gói xong (Đang đóng gói → Sẵn sàng giao hàng)
              response = await adminService.markAsPacked(order.id);
              break;
            case 'Sẵn sàng giao hàng':
              // ✅ SỬA: Bàn giao shipper (Sẵn sàng giao hàng → Đang giao hàng)
              const shipperConfirmed = window.confirm(
                `📋 Xác nhận bàn giao cho shipper?\n\n` +
                `Mã vận đơn: ${order.maVanDon || 'Không có'}\n\n` +
                `⚠️ Chỉ bấm OK khi shipper ĐÃ LẤY HÀNG!`
              );

              if (!shipperConfirmed) {
                setProcessingOrderId(null);
                return;
              }

              response = await adminService.shipOrder(order.id, { confirmed: true });
              break;
            case 'Đang giao hàng':
              response = await adminService.markAsDelivered(order.id);
              break;
            case 'Đã giao hàng':
              response = await adminService.completeOrder(order.id);
              break;
            case 'Giao hàng thất bại':
              response = await adminService.shipOrder(order.id, { confirmed: true });
              break;
            default:
              response = await adminService.updateOrderStatus(order.id, { trangThai: nextStatus });
          }
        }

        if (response.success) {
          // ✅ SỬA: Lấy trạng thái mới từ response (nếu có) hoặc dùng nextStatus
          const updatedStatus = response.data?.trangThai || response.data?.order?.trangThai || nextStatus;

          // ✅ CHỈ cập nhật state local khi API call thành công
          onUpdateStatus(order.id, updatedStatus);

          // Hiển thị thông báo sau khi đã cập nhật state
          setTimeout(() => {
            alert(`✅ ${response.message}`);
          }, 100);
        } else {
          // ✅ Nếu API call không thành công, không cập nhật state local
          alert(`❌ Lỗi: ${response.message || 'Không thể cập nhật trạng thái đơn hàng'}`);
        }
      } catch (error) {
        // ✅ Nếu có lỗi, hiển thị thông báo và KHÔNG cập nhật state local
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
        alert(`❌ Lỗi: ${errorMessage}`);
        console.error('❌ [OrderTable] Lỗi khi cập nhật trạng thái:', error);
      } finally {
        setProcessingOrderId(null);
      }
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
      <div className="order-table-empty" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        minHeight: '400px'
      }}>
        {/* Icon lớn với gradient */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <Package size={56} color="white" />
        </div>

        {/* Tiêu đề */}
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '0.75rem',
          textAlign: 'center'
        }}>
          Chưa có đơn hàng nào
        </h3>

        {/* Mô tả */}
        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '2rem',
          textAlign: 'center',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          Hệ thống đang sẵn sàng tiếp nhận đơn hàng đầu tiên!
          Khi khách hàng đặt hàng, bạn sẽ thấy các đơn hàng xuất hiện ở đây.
        </p>

        {/* Hướng dẫn nhanh */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '700px'
        }}>
          {/* Card 1 */}
          <div style={{
            flex: '1 1 200px',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: '12px',
            border: '2px solid #667eea30',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <ShoppingBag size={32} color="#667eea" />
            </div>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Khách hàng đặt hàng
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Qua website hoặc ứng dụng
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            flex: '1 1 200px',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
            borderRadius: '12px',
            border: '2px solid #f093fb30',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Bell size={32} color="#f093fb" />
            </div>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Nhận thông báo
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Tự động cập nhật mỗi 30 giây
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            flex: '1 1 200px',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
            borderRadius: '12px',
            border: '2px solid #4facfe30',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={32} color="#4facfe" />
            </div>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Xử lý đơn hàng
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Cập nhật trạng thái dễ dàng
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1rem 1.5rem',
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          maxWidth: '600px'
        }}>
          <AlertCircle size={20} color="#78350f" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: '1.5' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Mẹo:</strong>
            Bạn có thể tạo đơn hàng thử nghiệm bằng cách:
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              <li>Đăng ký tài khoản khách hàng mới</li>
              <li>Thêm sản phẩm vào giỏ hàng</li>
              <li>Tiến hành đặt hàng</li>
            </ul>
          </div>
        </div>
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
            <th>Mã vận đơn</th>
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
                      {expandedOrderId === order.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <strong>{order.maHD}</strong>
                  </div>
                </td>

                <td className="customer-col">
                  <div className="customer-info">
                    <div className="customer-name">{order.khachHang?.hoTen || 'N/A'}</div>
                    <div className="customer-contact" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      {order.khachHang?.dienThoai || 'N/A'}
                    </div>
                  </div>
                </td>

                <td className="tracking-col">
                  {order.maVanDon ? (
                    <span className="tracking-code">
                      {order.maVanDon}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>-</span>
                  )}
                </td>

                <td className="date-col">
                  {formatDate(order.ngayLap)}
                </td>

                <td className="price-col">
                  <span className="total-price">{formatPrice(order.tongTien || order.thanhTien)}</span>
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
                    {order.phuongThucThanhToan?.ten || order.phuongThucThanhToan?.Ten || '-'}
                  </span>
                </td>

                <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                  {getNextStatus(order.trangThai) ? (
                    <button
                      className="btn-update-status"
                      onClick={() => handleUpdateStatus(order)}
                      disabled={processingOrderId === order.id}
                      title={`Chuyển sang: ${getNextStatus(order.trangThai)}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: processingOrderId === order.id ? 0.6 : 1,
                        cursor: processingOrderId === order.id ? 'wait' : 'pointer'
                      }}
                    >
                      {processingOrderId === order.id ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          {getStatusIcon(getNextStatus(order.trangThai))} {getActionButtonText(order.trangThai)}
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="status-final" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      {order.trangThai === 'Đã hủy' ? <XCircle size={16} /> : <CheckCircle size={16} />} Kết thúc
                    </span>
                  )}
                </td>
              </tr>

              {/* Chi tiết đơn hàng khi expand */}
              {expandedOrderId === order.id && (
                <tr className="order-detail-row">
                  <td colSpan="8">
                    <div className="order-detail">
                      {/* Thông tin khách hàng */}
                      <div className="detail-section">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={20} /> Thông tin khách hàng
                        </h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Họ tên:</span>
                            <span className="detail-value">
                              {order.diaChiGiaoHang?.tenNguoiNhan || order.khachHang.hoTen}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{order.khachHang.email}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Số điện thoại:</span>
                            <span className="detail-value">
                              {order.diaChiGiaoHang?.soDienThoai || order.khachHang.dienThoai}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Địa chỉ giao hàng:</span>
                            <span className="detail-value">
                              {(() => {
                                // Debug log
                                if (!order.diaChiGiaoHang) {
                                  console.log('⚠️ [OrderTable] Không có diaChiGiaoHang cho order:', order.id, order.maHD);
                                }
                                if (order.diaChiGiaoHang) {
                                  return (
                                    <>
                                      {order.diaChiGiaoHang.diaChiChiTiet && `${order.diaChiGiaoHang.diaChiChiTiet}, `}
                                      {order.diaChiGiaoHang.tenPhuong && `${order.diaChiGiaoHang.tenPhuong}, `}
                                      {order.diaChiGiaoHang.tenQuan && `${order.diaChiGiaoHang.tenQuan}, `}
                                      {order.diaChiGiaoHang.tenTinh || ''}
                                    </>
                                  );
                                }
                                return 'Chưa cập nhật địa chỉ';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Danh sách sản phẩm */}
                      {order.chiTiet && order.chiTiet.length > 0 && (
                        <div className="detail-section">
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag size={20} /> Danh sách sản phẩm ({order.chiTiet.length} loại)
                          </h4>
                          <div className="products-list">
                            {order.chiTiet.map((item, index) => (
                              <div key={index} className="product-item">
                                <div className="product-image">
                                  {/* ✅ FIX: Backend trả về hinhAnhUrl (sau DTOMapper) */}
                                  {item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.hinhAnh ? (
                                    <img
                                      src={config.getImageUrl(item.sanPham.hinhAnhUrl || item.sanPham.hinhAnhURL || item.sanPham.hinhAnh)}
                                      alt={item.sanPham?.ten || 'Sản phẩm'}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                      }}
                                    />
                                  ) : (
                                    <div className="no-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Package size={32} color="#999" />
                                    </div>
                                  )}
                                </div>
                                <div className="product-info">
                                  <div className="product-name">
                                    {item.sanPham?.ten || 'Sản phẩm không xác định'}
                                  </div>
                                  <div className="product-details">
                                    <span className="product-quantity">
                                      Số lượng: <strong>{item.soLuong}</strong>
                                    </span>
                                    <span className="product-price">
                                      Đơn giá: <strong>{formatPrice(item.donGia)}</strong>
                                    </span>
                                  </div>
                                </div>
                                <div className="product-total">
                                  <div className="total-label">Thành tiền:</div>
                                  <div className="total-value">{formatPrice(item.thanhTien)}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tổng cộng */}
                          <div className="order-summary">
                            <div className="summary-row">
                              <span>Tổng số lượng:</span>
                              <strong>{order.tongSoLuongSanPham} sản phẩm</strong>
                            </div>
                            <div className="summary-row total">
                              <span>Tổng tiền:</span>
                              <strong className="total-amount">{formatPrice(order.tongTien || order.thanhTien)}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ghi chú */}
                      {order.ghiChu && (
                        <div className="detail-section">
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} /> Ghi chú
                          </h4>
                          <div className="order-notes">
                            {order.ghiChu}
                          </div>
                        </div>
                      )}
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
