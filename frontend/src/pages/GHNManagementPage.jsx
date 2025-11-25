/**
 * GHN Management Page
 * Trang quản lý và theo dõi trạng thái vận chuyển GHN
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  RefreshCw, 
  Search, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { adminService } from '../services';
import shippingService from '../services/shippingService';
import AdminLayout from '../layouts/AdminLayout';
import { Button, Card, Input, Badge, Loading } from '../components/ui';
import Toast from '../components/Toast';
import GHNTracking from '../components/GHNTracking';
import '../styles/GHNManagementPage.css';

const GHNManagementPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, hasGHN, noGHN

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllOrders({
        page: 1,
        limit: 100 // Lấy nhiều đơn để filter
      });

      if (response.success) {
        // Xử lý response - getAllOrders trả về response.data là array
        const ordersList = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.orders || response.data?.hoaDons || []);
        
        // Filter chỉ lấy đơn có mã vận đơn GHN
        const ordersWithGHN = ordersList.filter(order => {
          const ghnInfo = order.thongTinVanChuyen || {};
          return ghnInfo.maVanDon || 
                 ghnInfo.MaVanDon || 
                 order.maVanDon || 
                 order.MaVanDon;
        });
        setOrders(ordersWithGHN);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewTracking = async (order) => {
    try {
      setSelectedOrder(order);
      setTrackingData(null);
      
      const response = await shippingService.getGHNTracking(order.id || order.ID);
      if (response.success) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error('Error loading tracking:', error);
      showToast('Không thể tải thông tin tracking', 'error');
    }
  };

  const handleSyncStatus = async (orderId) => {
    try {
      setSyncing(true);
      const response = await shippingService.syncGHNStatus(orderId);
      if (response.success) {
        showToast('Đã cập nhật trạng thái GHN thành công', 'success');
        // Reload tracking nếu đang xem
        if (selectedOrder && selectedOrder.id === orderId) {
          await handleViewTracking(selectedOrder);
        }
        // Reload danh sách
        await loadOrders();
      }
    } catch (error) {
      console.error('Error syncing status:', error);
      showToast('Không thể đồng bộ trạng thái', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return { variant: 'secondary', text: 'Chưa có' };
    
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('giao hàng')) {
      return { variant: 'success', text: 'Đã giao hàng' };
    }
    if (statusLower.includes('delivering') || statusLower.includes('đang giao')) {
      return { variant: 'info', text: 'Đang giao hàng' };
    }
    if (statusLower.includes('picked') || statusLower.includes('lấy hàng')) {
      return { variant: 'warning', text: 'Đã lấy hàng' };
    }
    if (statusLower.includes('fail') || statusLower.includes('thất bại')) {
      return { variant: 'danger', text: 'Thất bại' };
    }
    return { variant: 'secondary', text: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      (order.maHD || order.MaHD || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.thongTinVanChuyen?.maVanDon || order.maVanDon || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="ghn-management-page">
          <Loading />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="ghn-management-page">
        {/* Header */}
        <div className="ghn-header-section">
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
                <MapPin className="text-teal-600" size={32} />
                Quản lý GHN - Theo dõi vận chuyển
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi trạng thái đơn hàng vận chuyển qua GHN
              </p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc mã vận đơn GHN..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Button
              variant="primary"
              onClick={loadOrders}
              icon={<RefreshCw size={18} />}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Tổng đơn GHN</p>
                  <p className="text-2xl font-bold text-blue-700">{orders.length}</p>
                </div>
                <Truck className="text-blue-500" size={32} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Đã giao hàng</p>
                  <p className="text-2xl font-bold text-green-700">
                    {orders.filter(o => {
                      const status = o.thongTinVanChuyen?.trangThaiGHN || '';
                      return status.toLowerCase().includes('delivered');
                    }).length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Đang giao</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {orders.filter(o => {
                      const status = o.thongTinVanChuyen?.trangThaiGHN || '';
                      return status.toLowerCase().includes('delivering');
                    }).length}
                  </p>
                </div>
                <Clock className="text-orange-500" size={32} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Chờ lấy hàng</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {orders.filter(o => {
                      const status = o.thongTinVanChuyen?.trangThaiGHN || '';
                      return status.toLowerCase().includes('picking') || status.toLowerCase().includes('ready');
                    }).length}
                  </p>
                </div>
                <Package className="text-purple-500" size={32} />
              </div>
            </div>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Danh sách đơn hàng GHN ({filteredOrders.length})
            </h2>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">
                  {searchTerm ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào có mã vận đơn GHN'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="ghn-orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Mã vận đơn GHN</th>
                      <th>Trạng thái GHN</th>
                      <th>Ngày gửi hàng</th>
                      <th>Ngày giao dự kiến</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const ghnInfo = order.thongTinVanChuyen || {};
                      const ghnOrderCode = ghnInfo.maVanDon || order.maVanDon;
                      const statusBadge = getStatusBadge(ghnInfo.trangThaiGHN);
                      
                      return (
                        <tr key={order.id || order.ID}>
                          <td>
                            <strong className="text-primary-600">
                              {order.maHD || order.MaHD}
                            </strong>
                          </td>
                          <td>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {ghnOrderCode || 'N/A'}
                            </code>
                          </td>
                          <td>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.text}
                            </Badge>
                          </td>
                          <td>{formatDate(ghnInfo.ngayGuiHang)}</td>
                          <td>{formatDate(ghnInfo.ngayGiaoDuKien)}</td>
                          <td>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTracking(order)}
                                icon={<MapPin size={16} />}
                              >
                                Xem tracking
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSyncStatus(order.id || order.ID)}
                                disabled={syncing}
                                icon={<RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />}
                              >
                                Cập nhật
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Tracking Modal/Detail */}
        {selectedOrder && (
          <div className="mt-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Chi tiết tracking - Đơn hàng {selectedOrder.maHD || selectedOrder.MaHD}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(null);
                      setTrackingData(null);
                    }}
                  >
                    Đóng
                  </Button>
                </div>
                <GHNTracking 
                  orderId={selectedOrder.id || selectedOrder.ID}
                  orderCode={selectedOrder.maHD || selectedOrder.MaHD}
                />
              </div>
            </Card>
          </div>
        )}

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

export default GHNManagementPage;

