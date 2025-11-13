import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart } from '../api/cartApi';
import { createOrder, createGuestOrder } from '../api/orderApi';
import { createVNPayPaymentUrl } from '../api/paymentApi';
import MainLayout from '../layouts/MainLayout';
import { Loading } from '../components/ui';
import Toast from '../components/Toast';
import config from '../config';

const PaymentMethodPage = () => {
  const API_BASE_URL = config.API_BASE_URL;
  
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_BASE_URL}${imagePath}`;
    if (!imagePath.startsWith('/')) return `${API_BASE_URL}/uploads/${imagePath}`;
    return '/barbie.jpg';
  };
  
  const handleImageError = (e) => {
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
    }
  };

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('cod'); // Default to COD
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông tin khách hàng từ state (được truyền từ CheckoutPage)
  const customerInfo = location.state?.customerInfo;

  useEffect(() => {
    // Kiểm tra xem có thông tin khách hàng không
    if (!customerInfo) {
      showToast('Vui lòng nhập thông tin giao hàng trước', 'warning');
      setTimeout(() => navigate('/checkout'), 1500);
      return;
    }
    loadCart();
  }, [customerInfo]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response.success && response.data) {
        const items = response.data.items || [];
        if (items.length === 0) {
          showToast('Giỏ hàng của bạn đang trống', 'warning');
          setTimeout(() => navigate('/cart'), 1500);
          return;
        }
        
        const normalizedItems = items.map(item => ({
          ID: item.id || item.ID,
          SanPhamID: item.sanPhamId || item.SanPhamID,
          SoLuong: item.soLuong || item.SoLuong,
          DonGia: item.donGia || item.DonGia,
          sanPham: {
            ID: item.sanPham?.id || item.sanPham?.ID,
            Ten: item.sanPham?.ten || item.sanPham?.Ten,
            GiaBan: item.sanPham?.giaBan || item.sanPham?.GiaBan,
            Ton: item.sanPham?.ton || item.sanPham?.Ton,
            HinhAnhURL: item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL
          }
        }));
        
        setCartItems(normalizedItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      showToast(error.message || 'Không thể tải giỏ hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.DonGia) * item.SoLuong);
    }, 0);
  };

  const calculateShippingFee = () => {
    return 30000;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.SoLuong, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      let orderResponse;

      if (selectedMethod === 'cod') {
        // COD Payment - Create order and navigate to success page immediately
        if (user) {
          const orderData = {
            dienThoai: customerInfo.dienThoai,
            diaChiGiaoHang: `${customerInfo.diaChi}, ${customerInfo.phuongXa}, ${customerInfo.quanHuyen}, ${customerInfo.tinhThanh}`,
            phuongThucThanhToanId: 1, // 1 = COD
            ghiChu: customerInfo.ghiChu || ''
          };

          orderResponse = await createOrder(orderData);
        } else {
          const { getOrCreateSessionId } = await import('../api/cartApi');
          const sessionId = getOrCreateSessionId();

          const orderData = {
            sessionId: sessionId,
            hoTen: customerInfo.hoTen,
            email: customerInfo.email,
            dienThoai: customerInfo.dienThoai,
            diaChi: customerInfo.diaChi,
            tinhThanh: customerInfo.tinhThanh,
            quanHuyen: customerInfo.quanHuyen,
            phuongXa: customerInfo.phuongXa,
            phuongThucThanhToanId: 1, // 1 = COD
            ghiChu: customerInfo.ghiChu || ''
          };

          orderResponse = await createGuestOrder(orderData);
        }

        if (orderResponse.success) {
          const orderId = orderResponse.data.hoaDon.id;
          const orderCode = orderResponse.data.hoaDon.maHD;
          const totalAmount = orderResponse.data.hoaDon.tongTien;

          showToast('Đặt hàng thành công!', 'success', 2000);
          
          setTimeout(() => {
            navigate('/payment/return', {
              state: {
                success: true,
                orderId: orderId,
                orderCode: orderCode,
                amount: totalAmount,
                paymentMethod: 'COD',
                message: 'Đặt hàng COD thành công'
              }
            });
          }, 1000);
        }
      } else if (selectedMethod === 'vnpay') {
        // VNPay Payment - Existing logic
        if (user) {
          const orderData = {
            dienThoai: customerInfo.dienThoai,
            diaChiGiaoHang: `${customerInfo.diaChi}, ${customerInfo.phuongXa}, ${customerInfo.quanHuyen}, ${customerInfo.tinhThanh}`,
            phuongThucThanhToanId: 2, // 2 = VNPay
            ghiChu: customerInfo.ghiChu || ''
          };

          orderResponse = await createOrder(orderData);
        } else {
          const { getOrCreateSessionId } = await import('../api/cartApi');
          const sessionId = getOrCreateSessionId();

          const orderData = {
            sessionId: sessionId,
            hoTen: customerInfo.hoTen,
            email: customerInfo.email,
            dienThoai: customerInfo.dienThoai,
            diaChi: customerInfo.diaChi,
            tinhThanh: customerInfo.tinhThanh,
            quanHuyen: customerInfo.quanHuyen,
            phuongXa: customerInfo.phuongXa,
            phuongThucThanhToanId: 2,
            ghiChu: customerInfo.ghiChu || ''
          };

          orderResponse = await createGuestOrder(orderData);
        }

        if (orderResponse.success) {
          const orderId = orderResponse.data.hoaDon.id;
          const totalAmount = orderResponse.data.hoaDon.tongTien;

          showToast('Đang chuyển đến trang thanh toán...', 'info', 2000);
          
          try {
            const paymentResponse = await createVNPayPaymentUrl(
              orderId,
              totalAmount,
              '',
              'vn'
            );

            if (paymentResponse.success && paymentResponse.data.paymentUrl) {
              window.location.href = paymentResponse.data.paymentUrl;
            } else {
              throw new Error('Không nhận được URL thanh toán');
            }
          } catch (paymentError) {
            showToast(
              paymentError.message || 'Không thể tạo URL thanh toán. Vui lòng thử lại.',
              'error'
            );
            setSubmitting(false);
            return;
          }
        }
      } else {
        showToast('Phương thức thanh toán không hợp lệ', 'warning');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast(error.message || 'Không thể tạo đơn hàng', 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải thông tin..." fullScreen />
      </MainLayout>
    );
  }

  const subtotal = calculateTotal();
  const shippingFee = calculateShippingFee();
  const total = subtotal + shippingFee;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm flex items-center gap-2">
          <Link to="/cart" className="text-blue-600 hover:underline">Giỏ hàng</Link>
          <span className="text-gray-400">›</span>
          <Link to="/checkout" className="text-blue-600 hover:underline">Thông tin giao hàng</Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-700 font-medium">Phương thức thanh toán</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Phương Thức Thanh Toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phương thức thanh toán bên trái */}
          <div>
            {/* Thông tin giao hàng đã nhập */}
            {customerInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">Thông tin giao hàng</h3>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Thay đổi
                  </button>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>{customerInfo.hoTen}</strong></p>
                  <p>{customerInfo.email}</p>
                  <p>{customerInfo.dienThoai}</p>
                  <p className="text-gray-600">
                    {customerInfo.diaChi}, {customerInfo.phuongXa}, {customerInfo.quanHuyen}, {customerInfo.tinhThanh}
                  </p>
                  {customerInfo.ghiChu && (
                    <p className="text-gray-600 italic">Ghi chú: {customerInfo.ghiChu}</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Chọn phương thức thanh toán</h3>
              
              {/* COD Option - Enabled */}
              <label 
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMethod === 'cod' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('cod')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedMethod === 'cod'}
                  onChange={() => setSelectedMethod('cod')}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-3xl shadow-sm">
                    💵
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-xs text-green-600 font-medium">✅ Đã kích hoạt - Dễ dàng test</div>
                  </div>
                </div>
              </label>

              {/* VNPay Option */}
              <label 
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMethod === 'vnpay' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('vnpay')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={selectedMethod === 'vnpay'}
                  onChange={() => setSelectedMethod('vnpay')}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center shadow-sm">
                    <img 
                      src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                      alt="VNPay" 
                      className="h-8"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Thanh toán qua VNPay</div>
                    <div className="text-xs text-gray-600">Hỗ trợ ATM, Visa, MasterCard, JCB, QR Pay</div>
                  </div>
                </div>
              </label>

              {/* Momo Option - Disabled */}
              <label className="flex items-center gap-3 p-4 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed opacity-60">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  disabled
                  className="w-5 h-5"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center shadow-sm">
                    <img 
                      src="https://developers.momo.vn/v3/img/logo.svg" 
                      alt="MoMo" 
                      className="h-8"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">Ví điện tử MoMo</div>
                    <div className="text-xs text-gray-500">Tạm thời không khả dụng</div>
                  </div>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  ← Quay lại
                </button>
                
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedMethod === 'cod'
                      ? 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
                      : 'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600'
                  }`}
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : selectedMethod === 'cod' ? '✅ Đặt hàng COD' : '💳 Hoàn tất đơn hàng'}
                </button>
              </div>
            </form>
          </div>

          {/* Tóm tắt đơn hàng bên phải */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Đơn hàng ({getTotalItems()} sản phẩm)
              </h3>
              
              {/* Danh sách sản phẩm */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b border-gray-100">
                    <div className="relative flex-shrink-0">
                      <img
                        src={buildImageUrl(item.sanPham?.HinhAnhURL)}
                        alt={item.sanPham?.Ten}
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={handleImageError}
                      />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.SoLuong}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 line-clamp-2">
                        {item.sanPham?.Ten}
                      </div>
                      <div className="text-sm font-semibold text-red-600 mt-1">
                        {(parseFloat(item.DonGia) * item.SoLuong).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mã giảm giá */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                    Sử dụng
                  </button>
                </div>
              </div>

              {/* Tính toán */}
              <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Tổng cộng */}
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Tổng cộng:</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">VND</div>
                    <div className="text-2xl font-bold text-red-600">
                      {total.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default PaymentMethodPage;
