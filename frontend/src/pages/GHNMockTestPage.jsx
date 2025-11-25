/**
 * GHN Mock Test Page
 * Trang để test và quản lý mock mode của GHN
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  RefreshCw, 
  ArrowLeft, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock,
  AlertCircle,
  List,
  Settings,
  Zap
} from 'lucide-react';
import shippingService from '../services/shippingService';
import AdminLayout from '../layouts/AdminLayout';
import { Button, Card, Badge, Loading } from '../components/ui';
import Toast from '../components/Toast';
import '../styles/GHNMockTestPage.css';

const GHNMockTestPage = () => {
  const navigate = useNavigate();
  const [mockOrders, setMockOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadMockOrders();
  }, []);

  const loadMockOrders = async () => {
    try {
      setLoading(true);
      const response = await shippingService.getMockOrders();
      if (response.success) {
        setMockOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading mock orders:', error);
      showToast('Không thể tải danh sách đơn hàng mock', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (ghnOrderCode) => {
    try {
      setProcessing(prev => ({ ...prev, [ghnOrderCode]: true }));
      
      const response = await shippingService.advanceMockStatus(ghnOrderCode);
      
      if (response.success) {
        showToast(`Đã chuyển trạng thái: ${response.data.newStatusText}`, 'success');
        await loadMockOrders();
        
        // Reload nếu đang xem order này
        if (selectedOrder?.orderCode === ghnOrderCode) {
          const updatedOrder = mockOrders.find(o => o.orderCode === ghnOrderCode);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      }
    } catch (error) {
      console.error('Error advancing status:', error);
      showToast(error.message || 'Không thể chuyển trạng thái', 'error');
    } finally {
      setProcessing(prev => ({ ...prev, [ghnOrderCode]: false }));
    }
  };

  const handleSetStatus = async (ghnOrderCode, status) => {
    try {
      setProcessing(prev => ({ ...prev, [`${ghnOrderCode}-${status}`]: true }));
      
      const response = await shippingService.setMockStatus(ghnOrderCode, status);
      
      if (response.success) {
        showToast(`Đã đặt trạng thái: ${response.data.statusText}`, 'success');
        await loadMockOrders();
        
        // Reload nếu đang xem order này
        if (selectedOrder?.orderCode === ghnOrderCode) {
          const updatedOrder = mockOrders.find(o => o.orderCode === ghnOrderCode);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      }
    } catch (error) {
      console.error('Error setting status:', error);
      showToast(error.message || 'Không thể đặt trạng thái', 'error');
    } finally {
      setProcessing(prev => ({ ...prev, [`${ghnOrderCode}-${status}`]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ready_to_pick': { variant: 'warning', text: 'Chờ lấy hàng' },
      'picking': { variant: 'info', text: 'Đang lấy hàng' },
      'picked': { variant: 'success', text: 'Đã lấy hàng' },
      'storing': { variant: 'info', text: 'Nhập kho' },
      'transporting': { variant: 'info', text: 'Đang luân chuyển' },
      'sorting': { variant: 'info', text: 'Đang phân loại' },
      'delivering': { variant: 'primary', text: 'Đang giao hàng' },
      'delivered': { variant: 'success', text: 'Đã giao hàng' }
    };
    
    return statusMap[status] || { variant: 'secondary', text: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const statusFlow = [
    { value: 'ready_to_pick', label: 'Chờ lấy hàng' },
    { value: 'picking', label: 'Đang lấy hàng' },
    { value: 'picked', label: 'Đã lấy hàng' },
    { value: 'storing', label: 'Nhập kho' },
    { value: 'transporting', label: 'Đang luân chuyển' },
    { value: 'sorting', label: 'Đang phân loại' },
    { value: 'delivering', label: 'Đang giao hàng' },
    { value: 'delivered', label: 'Đã giao hàng' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="ghn-mock-test-page">
          <Loading />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="ghn-mock-test-page">
        {/* Header */}
        <div className="mock-header">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              icon={<ArrowLeft size={20} />}
            >
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Zap className="text-yellow-500" size={32} />
                GHN Mock Mode - Test Tool
              </h1>
              <p className="text-gray-600 mt-1">
                Công cụ test và quản lý trạng thái đơn hàng GHN trong mock mode
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={loadMockOrders}
              icon={<RefreshCw size={18} />}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-6">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-yellow-800 mb-1">Mock Mode đang bật</h3>
                <p className="text-sm text-yellow-700">
                  Trang này chỉ hoạt động khi GHN_MOCK_MODE=true. 
                  Sử dụng để test các trạng thái đơn hàng mà không cần gọi API thật của GHN.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Mock Orders List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <List size={24} />
              Danh sách đơn hàng Mock ({mockOrders.length})
            </h2>

            {mockOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-2">Chưa có đơn hàng mock nào</p>
                <p className="text-sm text-gray-500">
                  Tạo đơn GHN trong mock mode để bắt đầu test
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const isProcessing = processing[order.orderCode];
                  const isSelected = selectedOrder?.orderCode === order.orderCode;
                  
                  return (
                    <div 
                      key={order.orderCode}
                      className={`mock-order-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="mock-order-header">
                        <div className="flex items-center gap-3">
                          <Truck className="text-teal-600" size={24} />
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {order.orderCode}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Trạng thái: <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Bước {order.statusIndex + 1}/{statusFlow.length}
                          </span>
                        </div>
                      </div>

                      <div className="mock-order-actions">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAdvanceStatus(order.orderCode)}
                            disabled={isProcessing || order.status === 'delivered'}
                            icon={<Play size={16} />}
                          >
                            {isProcessing ? 'Đang xử lý...' : 'Chuyển bước tiếp theo'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(isSelected ? null : order)}
                            icon={<Settings size={16} />}
                          >
                            {isSelected ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                          </Button>
                        </div>

                        {/* Quick Status Buttons */}
                        <div className="quick-status-buttons">
                          <span className="text-xs text-gray-500 mr-2">Đặt trạng thái:</span>
                          {statusFlow.map((status) => (
                            <Button
                              key={status.value}
                              variant={order.status === status.value ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleSetStatus(order.orderCode, status.value)}
                              disabled={processing[`${order.orderCode}-${status.value}`]}
                              className="text-xs"
                            >
                              {status.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      {isSelected && (
                        <div className="mock-order-details">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Trạng thái hiện tại</p>
                              <p className="font-semibold">{statusBadge.text}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Dự kiến giao hàng</p>
                              <p className="font-semibold">
                                {formatDate(order.expectedDeliveryTime)}
                              </p>
                            </div>
                          </div>

                          {/* Timeline */}
                          {order.timeline && order.timeline.length > 0 && (
                            <div className="timeline-section">
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Clock size={18} />
                                Timeline
                              </h4>
                              <div className="timeline-list">
                                {order.timeline.map((log, index) => (
                                  <div key={index} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                      <div className="flex justify-between items-start mb-1">
                                        <strong className="text-gray-800">
                                          {log.statusText || log.status}
                                        </strong>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(log.time)}
                                        </span>
                                      </div>
                                      {log.location && (
                                        <p className="text-sm text-gray-600 mb-1">
                                          📍 {log.location}
                                        </p>
                                      )}
                                      {log.note && (
                                        <p className="text-xs text-gray-500 italic">
                                          {log.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default GHNMockTestPage;

