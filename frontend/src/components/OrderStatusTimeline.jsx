import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Package, 
  PackageCheck, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Circle
} from 'lucide-react';
import './OrderStatusTimeline.css';

/**
 * Component hiển thị timeline theo dõi trạng thái đơn hàng
 * @param {Object} props
 * @param {string} props.currentStatus - Trạng thái hiện tại của đơn hàng
 * @param {Array} props.lichSuTrangThai - Lịch sử thay đổi trạng thái từ bảng LichSuTrangThaiDonHang
 * @param {Object} props.order - Thông tin đơn hàng (để lấy thông tin bổ sung)
 */
const OrderStatusTimeline = ({ currentStatus, lichSuTrangThai = [], order = {} }) => {
  // Định nghĩa các bước trong timeline
  const statusSteps = [
    {
      key: 'Chờ xử lý',
      label: 'Chờ xử lý',
      description: 'Đơn hàng đã được đặt và đang chờ xử lý',
      icon: Clock,
      color: '#fbbf24', // yellow-400
      bgColor: '#fef3c7' // yellow-100
    },
    {
      key: 'Đã xác nhận',
      label: 'Đã xác nhận',
      description: 'Đơn hàng đã được xác nhận bởi cửa hàng',
      icon: CheckCircle2,
      color: '#3b82f6', // blue-500
      bgColor: '#dbeafe' // blue-100
    },
    {
      key: 'Đang đóng gói',
      label: 'Đang đóng gói',
      description: 'Sản phẩm đang được đóng gói và chuẩn bị giao hàng',
      icon: Package,
      color: '#8b5cf6', // purple-500
      bgColor: '#ede9fe' // purple-100
    },
    {
      key: 'Sẵn sàng giao hàng',
      label: 'Sẵn sàng giao hàng',
      description: 'Đơn hàng đã sẵn sàng, chờ shipper lấy hàng',
      icon: PackageCheck,
      color: '#10b981', // green-500
      bgColor: '#d1fae5' // green-100
    },
    {
      key: 'Đang giao hàng',
      label: 'Đang giao hàng',
      description: 'Đơn hàng đang được vận chuyển đến bạn',
      icon: Truck,
      color: '#f59e0b', // amber-500
      bgColor: '#fef3c7' // amber-100
    },
    {
      key: 'Đã giao hàng',
      label: 'Đã giao hàng',
      description: 'Đơn hàng đã được giao thành công',
      icon: CheckCircle,
      color: '#10b981', // green-500
      bgColor: '#d1fae5' // green-100
    },
    {
      key: 'Hoàn thành',
      label: 'Hoàn thành',
      description: 'Đơn hàng đã hoàn tất',
      icon: CheckCircle,
      color: '#059669', // green-600
      bgColor: '#a7f3d0' // green-200
    }
  ];

  // Trạng thái đặc biệt (hủy, thất bại)
  const specialStatuses = [
    {
      key: 'Đã hủy',
      label: 'Đã hủy',
      description: 'Đơn hàng đã bị hủy',
      icon: XCircle,
      color: '#ef4444', // red-500
      bgColor: '#fee2e2' // red-100
    },
    {
      key: 'Giao hàng thất bại',
      label: 'Giao hàng thất bại',
      description: 'Giao hàng không thành công',
      icon: AlertCircle,
      color: '#f59e0b', // amber-500
      bgColor: '#fef3c7' // amber-100
    }
  ];

  // ✅ SỬ DỤNG LỊCH SỬ TRẠNG THÁI: Tạo map từ lichSuTrangThai để lấy thời gian thực tế
  const statusHistoryMap = {};
  if (lichSuTrangThai && lichSuTrangThai.length > 0) {
    lichSuTrangThai.forEach(item => {
      // Lưu thời gian khi chuyển sang trạng thái mới
      if (item.trangThaiMoi && !statusHistoryMap[item.trangThaiMoi]) {
        statusHistoryMap[item.trangThaiMoi] = {
          ngayThayDoi: item.ngayThayDoi,
          nguoiThayDoi: item.nguoiThayDoi,
          lyDo: item.lyDo
        };
      }
    });
  }

  // Tìm index của trạng thái hiện tại
  const getCurrentStatusIndex = () => {
    const index = statusSteps.findIndex(step => step.key === currentStatus);
    return index >= 0 ? index : -1;
  };

  const currentIndex = getCurrentStatusIndex();
  const isSpecialStatus = specialStatuses.some(s => s.key === currentStatus);
  const specialStatus = specialStatuses.find(s => s.key === currentStatus);

  // Xác định trạng thái của mỗi step
  // ✅ CẢI THIỆN: Sử dụng lichSuTrangThai để xác định step nào đã hoàn thành
  const getStepStatus = (stepIndex) => {
    if (isSpecialStatus) {
      // Nếu là trạng thái đặc biệt, tất cả các step đều là pending
      return 'pending';
    }

    const step = statusSteps[stepIndex];
    if (!step) return 'pending';

    // ✅ Nếu có lịch sử, kiểm tra xem trạng thái này đã được ghi nhận chưa
    if (lichSuTrangThai && lichSuTrangThai.length > 0) {
      const hasHistory = statusHistoryMap[step.key] || 
        lichSuTrangThai.some(item => item.trangThaiMoi === step.key);
      
      if (hasHistory && stepIndex < currentIndex) {
        return 'completed';
      } else if (step.key === currentStatus) {
        return 'current';
      } else {
        return 'pending';
      }
    }

    // Fallback: Dùng logic cũ nếu không có lịch sử
    if (currentIndex === -1) {
      return 'pending';
    }

    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  // Render step icon
  const renderStepIcon = (step, status) => {
    const Icon = step.icon;
    const size = 24;

    if (status === 'completed') {
      return (
        <div className="timeline-step-icon completed">
          <CheckCircle size={size} className="text-white" />
        </div>
      );
    } else if (status === 'current') {
      return (
        <div className="timeline-step-icon current" style={{ backgroundColor: step.color }}>
          <Icon size={size} className="text-white" />
        </div>
      );
    } else {
      return (
        <div className="timeline-step-icon pending">
          <Circle size={size} className="text-gray-300" />
        </div>
      );
    }
  };

  return (
    <div className="order-status-timeline">
      <div className="timeline-header">
        <h3 className="timeline-title">Theo Dõi Đơn Hàng</h3>
        {order.maVanDon && (
          <div className="tracking-code">
            <span className="tracking-label">Mã vận đơn:</span>
            <span className="tracking-value">{order.maVanDon}</span>
          </div>
        )}
      </div>

      {isSpecialStatus && specialStatus ? (
        // Hiển thị trạng thái đặc biệt
        <div className="timeline-special-status">
          <div 
            className="special-status-card"
            style={{ 
              borderColor: specialStatus.color,
              backgroundColor: specialStatus.bgColor 
            }}
          >
            <specialStatus.icon size={32} style={{ color: specialStatus.color }} />
            <div className="special-status-content">
              <h4 style={{ color: specialStatus.color }}>{specialStatus.label}</h4>
              <p>{specialStatus.description}</p>
            </div>
          </div>
        </div>
      ) : (
        // Hiển thị timeline bình thường
        <div className="timeline-steps">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const isLast = index === statusSteps.length - 1;

            return (
              <div key={step.key} className="timeline-step">
                <div className="timeline-step-content">
                  {renderStepIcon(step, stepStatus)}
                  <div className="timeline-step-info">
                    <h4 
                      className={`timeline-step-label ${stepStatus}`}
                      style={stepStatus === 'current' ? { color: step.color } : {}}
                    >
                      {step.label}
                    </h4>
                    <p className="timeline-step-description">{step.description}</p>
                    {/* ✅ HIỂN THỊ THỜI GIAN THỰC TẾ TỪ LỊCH SỬ */}
                    {statusHistoryMap[step.key] && statusHistoryMap[step.key].ngayThayDoi && (
                      <span className="timeline-step-time">
                        {new Date(statusHistoryMap[step.key].ngayThayDoi).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                    {stepStatus === 'current' && !statusHistoryMap[step.key] && (
                      <span className="timeline-step-time">
                        Đang xử lý...
                      </span>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div 
                    className={`timeline-connector ${stepStatus === 'completed' ? 'completed' : 'pending'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Thông tin bổ sung */}
      {order.thongTinVanChuyen && (
        <div className="timeline-extra-info">
          {order.thongTinVanChuyen.ngayGiaoDuKien && (
            <div className="extra-info-item">
              <span className="extra-info-label">Dự kiến giao hàng:</span>
              <span className="extra-info-value">
                {new Date(order.thongTinVanChuyen.ngayGiaoDuKien).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          {order.thongTinVanChuyen.donViVanChuyen && (
            <div className="extra-info-item">
              <span className="extra-info-label">Đơn vị vận chuyển:</span>
              <span className="extra-info-value">{order.thongTinVanChuyen.donViVanChuyen}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;

