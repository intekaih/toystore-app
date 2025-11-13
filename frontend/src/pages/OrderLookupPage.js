import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { Button, Loading } from '../components/ui';
import { Search } from 'lucide-react';
import Toast from '../components/Toast';

const OrderLookupPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập, redirect đến trang đơn hàng của họ
  React.useEffect(() => {
    if (user) {
      navigate('/orders');
    }
  }, [user, navigate]);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  // Hàm phát hiện loại input
  const detectInputType = (value) => {
    const trimmedValue = value.trim();
    
    // Kiểm tra mã đơn hàng (format: HDyyyyMMddXXX)
    if (/^HD\d{11}$/.test(trimmedValue)) {
      return { type: 'orderCode', value: trimmedValue };
    }
    
    // Kiểm tra email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return { type: 'email', value: trimmedValue };
    }
    
    // Kiểm tra số điện thoại (0XXXXXXXXX hoặc +84XXXXXXXXX)
    if (/^(0|\+84)[0-9]{9,10}$/.test(trimmedValue.replace(/\s/g, ''))) {
      return { type: 'phone', value: trimmedValue.replace(/\s/g, '') };
    }
    
    return { type: 'unknown', value: trimmedValue };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      showToast('Vui lòng nhập thông tin tra cứu', 'warning');
      return;
    }

    const { type, value } = detectInputType(searchValue);

    if (type === 'unknown') {
      showToast('Vui lòng nhập mã đơn hàng, email hoặc số điện thoại hợp lệ', 'warning');
      return;
    }

    setLoading(true);

    try {
      if (type === 'orderCode') {
        // Nếu là mã đơn hàng -> Chuyển thẳng đến trang chi tiết
        showToast('Đang tải đơn hàng...', 'info', 1000);
        setTimeout(() => {
          navigate(`/order/${value}`);
        }, 1000);
      } else {
        // Nếu là email/phone -> Gọi API lấy danh sách đơn hàng
        const { getOrdersByContact } = await import('../api/orderApi');
        const response = await getOrdersByContact({
          email: type === 'email' ? value : undefined,
          phoneNumber: type === 'phone' ? value : undefined
        });

        if (response.success && response.data.orders.length > 0) {
          setSearchResults({
            type: type === 'email' ? 'Email' : 'Số điện thoại',
            value: value,
            orders: response.data.orders
          });
          showToast(`Tìm thấy ${response.data.orders.length} đơn hàng`, 'success');
        } else {
          showToast('Không tìm thấy đơn hàng nào', 'warning');
          setSearchResults(null);
        }
      }
    } catch (error) {
      console.error('Error looking up order:', error);
      showToast(error.message || 'Không tìm thấy đơn hàng', 'error');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (orderCode) => {
    navigate(`/order/${orderCode}`);
  };

  const getPlaceholder = () => {
    return 'Nhập mã đơn hàng, email hoặc số điện thoại';
  };

  if (loading && detectInputType(searchValue).type === 'orderCode') {
    return (
      <MainLayout>
        <Loading text="Đang tải đơn hàng..." fullScreen />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-cute py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header - Compact & Inline */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-100 to-rose-100 rounded-full">
              <Search size={24} className="text-primary-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-800">
              Tra Cứu Đơn Hàng
            </h1>
          </div>

          {/* Form - Single Input */}
          <form onSubmit={handleSubmit} className="bg-white rounded-bubble border-2 border-primary-100 shadow-soft p-6 mb-6">
            <div className="space-y-4">
              {/* Single Search Input */}
              <div>
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-cute focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    disabled={loading}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-50 rounded-full">
                    📦 <strong>Mã đơn hàng:</strong> HD20241112001
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-50 rounded-full">
                    📧 <strong>Email:</strong> email@example.com
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-50 rounded-full">
                    📱 <strong>SĐT:</strong> 0987654321
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                loading={loading}
                icon={<Search size={20} />}
              >
                {loading ? 'Đang tra cứu...' : 'Tra cứu'}
              </Button>
            </div>
          </form>

          {/* Search Results - Danh sách đơn hàng */}
          {searchResults && searchResults.orders.length > 0 && (
            <div className="bg-white rounded-bubble border-2 border-primary-100 shadow-soft p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Đơn Hàng Của Bạn
                </h2>
                <p className="text-sm text-gray-600">
                  {searchResults.type}: <strong>{searchResults.value}</strong>
                </p>
              </div>

              <div className="space-y-3">
                {searchResults.orders.map((order) => (
                  <div
                    key={order.maHD}
                    onClick={() => handleOrderClick(order.maHD)}
                    className="flex items-center justify-between p-4 border-2 border-primary-100 rounded-cute hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800 group-hover:text-primary-600">
                          #{order.maHD}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          order.trangThai === 'Đã thanh toán' ? 'bg-green-100 text-green-700' :
                          order.trangThai === 'Chờ thanh toán' ? 'bg-yellow-100 text-yellow-700' :
                          order.trangThai === 'Đã hủy' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.trangThai}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {new Date(order.ngayLap).toLocaleDateString('vi-VN')}</span>
                        <span>📦 {order.soSanPham || 0} sản phẩm</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        {order.tongTien.toLocaleString('vi-VN')}₫
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Xem chi tiết →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">Bạn đã có tài khoản?</p>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Đăng nhập để xem tất cả đơn hàng
            </Button>
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
    </MainLayout>
  );
};

export default OrderLookupPage;
