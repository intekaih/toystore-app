import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService, orderService, paymentService } from '../services';
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
  // ✅ THÊM STATE CHO VOUCHER
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const customerInfo = location.state?.customerInfo;
  const [ghiChu, setGhiChu] = useState('');

  useEffect(() => {
    if (!customerInfo) {
      showToast('Vui lòng nhập thông tin giao hàng trước', 'warning');
      setTimeout(() => navigate('/checkout'), 1500);
      return;
    }
    setGhiChu(customerInfo.ghiChu || '');
    loadCart();
  }, [customerInfo]);

  const loadCart = async () => {
    try {
      setLoading(true);

      const response = await cartService.getCart();

      if (response.success && response.data) {
        const items = response.data || [];
        if (items.length === 0) {
          showToast('Giỏ hàng của bạn đang trống', 'warning');
          setTimeout(() => navigate('/cart'), 1500);
          return;
        }

        setCartItems(items);
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
      // ✅ Hỗ trợ cả 2 format: donGia (mới) và DonGia (cũ)
      const price = parseFloat(item.donGia || item.DonGia || 0);
      const quantity = parseInt(item.soLuong || item.SoLuong || 0);
      return total + (price * quantity);
    }, 0);
  };

  const calculateShippingFee = () => {
    return 30000;
  };

  // ✅ HÀM TÍNH VAT 10%
  const calculateVAT = () => {
    const subtotal = calculateTotal();
    return subtotal * 0.1; // 10% VAT
  };

  // ✅ HÀM TÍNH DISCOUNT TỪ VOUCHER
  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    
    // ✅ FIX: Sử dụng giaTriGiamDaTinh (giá trị đã tính toán từ API)
    // Không phải giaTriGiam (giá trị gốc từ DB: 50 cho 50%, 50000 cho 50k)
    const giaTriGiam = appliedVoucher.giaTriGiamDaTinh || 0;
    
    const subtotal = calculateTotal();
    
    // Đảm bảo không giảm quá tổng tiền
    return Math.min(giaTriGiam, subtotal);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => {
      // ✅ Hỗ trợ cả 2 format
      const quantity = parseInt(item.soLuong || item.SoLuong || 0);
      return total + quantity;
    }, 0);
  };

  // ✅ HÀM XỬ LÝ ÁP DỤNG VOUCHER - CHỈ KIỂM TRA, KHÔNG GHI VÀO DB
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã voucher');
      return;
    }

    try {
      setApplyingVoucher(true);
      setVoucherError('');

      // ✅ GỬI KÈM taiKhoanId (nếu đã đăng nhập)
      const requestBody = {
        maVoucher: voucherCode.trim(),
        tongTien: calculateTotal()
      };

      // Thêm taiKhoanId nếu user đã đăng nhập
      if (user && user.id) {
        requestBody.taiKhoanId = user.id;
      }

      console.log('🎟️ Gửi request kiểm tra voucher:', requestBody);

      const response = await fetch(`${API_BASE_URL}/api/vouchers/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAppliedVoucher(data.data);
        setVoucherError('');
        
        // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
        showToast(
          `✅ ${data.message}`, 
          'success', 
          3000
        );

        console.log('✅ Voucher hợp lệ:', data.data);
      } else {
        setVoucherError(data.message || 'Mã voucher không hợp lệ');
        setAppliedVoucher(null);
        showToast(data.message || 'Mã voucher không hợp lệ', 'error', 3000);
      }
    } catch (error) {
      console.error('❌ Lỗi kiểm tra voucher:', error);
      setVoucherError('Không thể kiểm tra voucher. Vui lòng thử lại.');
      setAppliedVoucher(null);
      showToast('Không thể kiểm tra voucher', 'error', 3000);
    } finally {
      setApplyingVoucher(false);
    }
  };

  // ✅ HÀM XÓA VOUCHER
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
    showToast('Đã xóa voucher', 'info', 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ DEBUG: Log voucher state NGAY KHI BẮT ĐẦU SUBMIT
    console.log('========== BẮT ĐẦU SUBMIT ==========');
    console.log('🎟️ appliedVoucher state hiện tại:', JSON.stringify(appliedVoucher, null, 2));
    console.log('🎟️ voucherCode:', voucherCode);
    console.log('🎟️ appliedVoucher?.maVoucher:', appliedVoucher?.maVoucher);
    console.log('=====================================');

    try {
      setSubmitting(true);

      // ✅ SỬA: Kiểm tra user đã đăng nhập chưa
      const isAuthenticated = !!user;
      
      // ✅ Lấy sessionId cho guest (nếu chưa đăng nhập)
      const getGuestSessionId = () => {
        let sessionId = sessionStorage.getItem('guestSessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('guestSessionId', sessionId);
        }
        return sessionId;
      };

      // ✅ DEBUG: Log thông tin voucher trước khi gửi
      console.log('🎟️ Applied Voucher State:', appliedVoucher);
      console.log('🎟️ Voucher Code sẽ gửi:', appliedVoucher?.maVoucher || 'null');

      // ✅ SỬA: Gửi đúng format dựa trên trạng thái đăng nhập
      let orderData;
      
      if (isAuthenticated) {
        // ✅ USER ĐÃ ĐĂNG NHẬP - Gửi format cho user
        orderData = {
          dienThoai: customerInfo.dienThoai,
          diaChiGiaoHang: customerInfo.diaChi,
          tinhThanh: customerInfo.tinhThanh,
          quanHuyen: customerInfo.quanHuyen,
          phuongXa: customerInfo.phuongXa,
          maTinhID: customerInfo.maTinhID,
          maQuanID: customerInfo.maQuanID,
          maPhuongXa: customerInfo.maPhuongXa,
          phuongThucThanhToanId: selectedMethod === 'cod' ? 1 : 2,
          ghiChu: ghiChu || '',
          // ✅ FIX: Gửi mã voucher dưới dạng string, không phải null
          maVoucher: appliedVoucher?.maVoucher || ''
        };
      } else {
        // ✅ GUEST - Gửi format cho guest (cần sessionId, hoTen, email)
        orderData = {
          sessionId: getGuestSessionId(),
          hoTen: customerInfo.hoTen,
          email: customerInfo.email || '',
          dienThoai: customerInfo.dienThoai,
          diaChiGiaoHang: customerInfo.diaChi,
          tinhThanh: customerInfo.tinhThanh,
          quanHuyen: customerInfo.quanHuyen,
          phuongXa: customerInfo.phuongXa,
          maTinhID: customerInfo.maTinhID,
          maQuanID: customerInfo.maQuanID,
          maPhuongXa: customerInfo.maPhuongXa,
          phuongThucThanhToanId: selectedMethod === 'cod' ? 1 : 2,
          ghiChu: ghiChu || '',
          // ✅ FIX: Gửi mã voucher dưới dạng string, không phải null
          maVoucher: appliedVoucher?.maVoucher || ''
        };
      }

      console.log('📦 Dữ liệu gửi lên backend:', orderData);
      console.log('👤 Đã đăng nhập:', isAuthenticated);

      let orderResponse;

      if (selectedMethod === 'cod') {
        orderResponse = await orderService.createOrder(orderData);

        if (orderResponse.success) {
          const orderId = orderResponse.data.hoaDon?.id || orderResponse.data.id;
          const orderCode = orderResponse.data.hoaDon?.maHD || orderResponse.data.maHD;
          const totalAmount = orderResponse.data.hoaDon?.tongTien || orderResponse.data.tongTien;

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
        orderResponse = await orderService.createOrder(orderData);

        if (orderResponse.success) {
          const orderId = orderResponse.data.hoaDon?.id || orderResponse.data.id;
          const totalAmount = orderResponse.data.hoaDon?.tongTien || orderResponse.data.tongTien;

          showToast('Đang chuyển đến trang thanh toán...', 'info', 2000);

          try {
            const paymentData = {
              orderId: orderId,
              amount: totalAmount,
              orderInfo: `Thanh toán đơn hàng #${orderId}`,
              returnUrl: `${window.location.origin}/payment/return`
            };

            console.log('💳 Gọi API tạo VNPay payment URL với data:', paymentData);

            const paymentResponse = await paymentService.createVNPayPayment(paymentData);

            console.log('📥 Response từ payment service:', paymentResponse);

            // ✅ FIX: Backend trả về paymentUrl trong data.paymentUrl, không phải paymentUrl trực tiếp
            const paymentUrl = paymentResponse.paymentUrl || paymentResponse.data?.paymentUrl;

            if (paymentResponse.success && paymentUrl) {
              console.log('✅ Đã nhận được payment URL:', paymentUrl);
              console.log('🚀 Đang chuyển hướng đến VNPay...');
              window.location.href = paymentUrl;
            } else {
              console.error('❌ Không nhận được payment URL. Response:', paymentResponse);
              throw new Error('Không nhận được URL thanh toán');
            }
          } catch (paymentError) {
            console.error('❌ Lỗi khi tạo VNPay payment:', paymentError);
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
  const discount = calculateDiscount(); // ✅ THÊM
  const vat = calculateVAT(); // ✅ THÊM
  const total = subtotal + shippingFee + vat - discount; // ✅ SỬA: Thêm VAT và trừ discount

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phương thức thanh toán bên trái */}
          <div>
            {/* Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Phương Thức Thanh Toán</h1>
            </div>

            {/* Thông tin giao hàng đã nhập */}
            {customerInfo && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <span>Thông tin giao hàng</span>
                  </h3>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                  >
                    ✏️ Sửa
                  </button>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-700 space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">👤 Người nhận:</span>
                      <span className="font-medium text-gray-900">{customerInfo.hoTen}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">📧 Email:</span>
                      <span className="text-gray-600">{customerInfo.email}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">📱 Điện thoại:</span>
                      <span className="text-gray-600">{customerInfo.dienThoai}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">📍 Địa chỉ:</span>
                      <span className="text-gray-600">
                        {customerInfo.diaChi}, {customerInfo.phuongXa}, {customerInfo.quanHuyen}, {customerInfo.tinhThanh}
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Ghi chú */}
                <div className="mt-3">
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    📝 Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Nhập ghi chú cho đơn hàng (ví dụ: Giao hàng vào buổi sáng, gọi trước khi giao...)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">💳</span>
                  <span>Chọn phương thức thanh toán</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vui lòng chọn một trong các phương thức thanh toán bên dưới
                </p>
                
                <div className="space-y-3">
                  {/* COD Option - Enabled */}
                  <label 
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === 'cod' 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMethod('cod')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={selectedMethod === 'cod'}
                      onChange={() => setSelectedMethod('cod')}
                      className="w-5 h-5 text-green-600 mt-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-3xl shadow-sm border-2 border-gray-200">
                          💵
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">Thanh toán khi nhận hàng (COD)</div>
                          <div className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                            <span>✅</span> Khuyến nghị
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* VNPay Option */}
                  <label 
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === 'vnpay' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMethod('vnpay')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={selectedMethod === 'vnpay'}
                      onChange={() => setSelectedMethod('vnpay')}
                      className="w-5 h-5 text-blue-600 mt-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border-2 border-gray-200">
                          <img 
                            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                            alt="VNPay" 
                            className="h-10"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">Thanh toán qua VNPay</div>
                          <div className="text-xs text-blue-600 font-medium mt-1">Thanh toán online an toàn</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Momo Option - Disabled */}
                  <div className="relative">
                    <label className="flex items-start gap-4 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl cursor-not-allowed opacity-60">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        disabled
                        className="w-5 h-5 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border-2 border-gray-200">
                            <img 
                              src="https://developers.momo.vn/v3/img/logo.svg" 
                              alt="MoMo" 
                              className="h-10"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-600 text-base">Ví điện tử MoMo</div>
                            <div className="text-xs text-gray-500 mt-1">Tạm thời không khả dụng</div>
                          </div>
                        </div>
                      </div>
                    </label>
                    <div className="absolute top-2 right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Sắp ra mắt
                    </div>
                  </div>
                </div>

              </div>

              {/* Order Confirmation Note */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-medium mb-2 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>Lưu ý quan trọng:</span>
                </p>
                <ul className="text-xs text-yellow-800 space-y-1 pl-7">
                  <li>• Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</li>
                  <li>• Sau khi đặt hàng, bạn sẽ nhận email xác nhận trong vài phút</li>
                  <li>• Đơn hàng không thể hủy sau khi đã xác nhận thanh toán</li>
                  <li>• Liên hệ hotline 1900-xxxx nếu cần hỗ trợ</li>
                </ul>
              </div>
            </form>
          </div>

          {/* Tóm tắt đơn hàng bên phải */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Xác Nhận Đơn Hàng</h2>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-5 sticky top-6 shadow-lg">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>🛒</span>
                  <span>Chi tiết đơn hàng</span>
                </span>
                <span className="text-sm font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {getTotalItems()} sản phẩm
                </span>
              </h3>
              
              {/* Danh sách sản phẩm */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => {
                  // ✅ Hỗ trợ cả 2 format field names
                  const itemPrice = parseFloat(item.donGia || item.DonGia || 0);
                  const itemQuantity = parseInt(item.soLuong || item.SoLuong || 0);
                  const itemImage = item.sanPham?.hinhAnhUrl || item.sanPham?.HinhAnhURL;
                  const itemName = item.sanPham?.ten || item.sanPham?.Ten;
                  
                  return (
                    <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="relative flex-shrink-0">
                        <img
                          src={buildImageUrl(itemImage)}
                          alt={itemName}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          onError={handleImageError}
                        />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                          {itemQuantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800 line-clamp-2 mb-2">
                          {itemName}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {itemPrice.toLocaleString('vi-VN')}₫ × {itemQuantity}
                          </span>
                          <span className="text-base font-bold text-red-600">
                            {(itemPrice * itemQuantity).toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mã giảm giá */}
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🎟️</span>
                  <span>Mã giảm giá / Voucher</span>
                </label>
                
                {!appliedVoucher ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherError('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyVoucher();
                          }
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                          voucherError 
                            ? 'border-red-300 focus:ring-red-400' 
                            : 'border-gray-300 focus:ring-yellow-400'
                        }`}
                        disabled={applyingVoucher}
                      />
                      <button 
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={applyingVoucher || !voucherCode.trim()}
                        className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingVoucher ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-spin">⏳</span>
                            <span>Đang kiểm tra...</span>
                          </span>
                        ) : (
                          'Áp dụng'
                        )}
                      </button>
                    </div>
                    
                    {voucherError && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <span>❌</span>
                        <span>{voucherError}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <div>
                          <p className="font-bold text-green-800 text-sm">{appliedVoucher.maVoucher}</p>
                          <p className="text-xs text-green-700">{appliedVoucher.ten}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="text-xs text-green-800 font-bold">
                      Giảm: {discount.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                )}
              </div>

              {/* Tính toán chi tiết */}
              <div className="space-y-3 mb-4 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <span>📦</span>
                    <span>Tạm tính:</span>
                  </span>
                  <span className="font-bold">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>🚚</span>
                    <span>Phí vận chuyển:</span>
                  </div>
                  <span className="font-bold text-green-600">{shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>🎁</span>
                    <span>Giảm giá:</span>
                  </div>
                  <span className={`font-bold ${discount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {discount > 0 ? `-${discount.toLocaleString('vi-VN')}₫` : '-0₫'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>VAT (10%):</span>
                  </div>
                  <span className="font-bold text-blue-600">{vat.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2.5 text-xs text-green-800">
                  <p className="flex items-center gap-2 font-medium">
                    <span>💡</span>
                    <span>Mua thêm {(500000 - subtotal > 0 ? (500000 - subtotal).toLocaleString('vi-VN') : 0)}₫ để được miễn phí ship!</span>
                  </p>
                </div>
              </div>

              {/* Tổng cộng */}
              <div className="pt-3 border-t-2 border-gray-300 bg-white -mx-5 -mb-5 px-5 pb-3 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Tổng thanh toán:</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">
                      {total.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <span>←</span> Quay lại
                </button>
                
                <button
                  type="submit"
                  form="payment-form"
                  className={`flex-1 px-6 py-3 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
                    selectedMethod === 'cod'
                      ? 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
                      : 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Đang xử lý...
                    </span>
                  ) : selectedMethod === 'cod' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>✅</span>
                      Hoàn tất đặt hàng (COD)
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>💳</span>
                      Thanh toán ngay ({total.toLocaleString('vi-VN')}₫)
                    </span>
                  )}
                </button>
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
