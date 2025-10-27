import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart } from '../api/cartApi';
import { createOrder } from '../api/orderApi';
import { createVNPayPaymentUrl } from '../api/paymentApi';
import { CreditCard, MapPin, User, Phone, Mail, MessageSquare, ArrowLeft, Check, Truck, RefreshCw, Shield } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading } from '../components/ui';
import Toast from '../components/Toast';

const CheckoutPage = () => {
  // Backend API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Build full image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    
    // Nếu đã là full URL (http/https)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /uploads/
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Nếu chỉ là filename
    if (!imagePath.startsWith('/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    
    return '/barbie.jpg';
  };
  
  // Handle image error
  const handleImageError = (e) => {
    console.warn('❌ Lỗi load ảnh trong checkout:', e.target.src);
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
    }
  };

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || '',
    dienThoai: user?.dienThoai || '',
    email: user?.email || '',
    diaChiGiaoHang: '',
    phuongThucThanhToanId: 1,
    ghiChu: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      showToast('Vui lòng đăng nhập để đặt hàng', 'warning');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    loadCart();
  }, [user, navigate]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }

    if (!formData.dienThoai.trim()) {
      newErrors.dienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.dienThoai.replace(/\s/g, ''))) {
      newErrors.dienThoai = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.diaChiGiaoHang.trim()) {
      newErrors.diaChiGiaoHang = 'Vui lòng nhập địa chỉ giao hàng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.DonGia) * item.SoLuong);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.SoLuong, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        diaChiGiaoHang: formData.diaChiGiaoHang,
        phuongThucThanhToanId: parseInt(formData.phuongThucThanhToanId),
        ghiChu: formData.ghiChu
      };

      const response = await createOrder(orderData);

      if (response.success) {
        const orderId = response.data.hoaDon.id;
        const totalAmount = response.data.hoaDon.tongTien;

        if (formData.phuongThucThanhToanId === 2) {
          showToast('Đang chuyển đến trang thanh toán VNPay...', 'info', 2000);
          
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
        } else {
          showToast('Đặt hàng thành công! 🎉', 'success', 2000);
          
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        }
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

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold text-gradient-primary mb-2 flex items-center justify-center gap-3">
            <CreditCard size={40} />
            Thanh Toán Đơn Hàng
          </h1>
          <p className="text-gray-600">
            Vui lòng kiểm tra thông tin và hoàn tất đơn hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thông tin người nhận */}
              <div className="bg-white rounded-bubble shadow-soft border-2 border-primary-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={24} className="text-primary-500" />
                  Thông Tin Người Nhận
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="hoTen"
                      value={formData.hoTen}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className={`input-cute ${errors.hoTen ? 'border-red-400' : ''}`}
                    />
                    {errors.hoTen && (
                      <p className="mt-1 text-xs text-red-500">⚠️ {errors.hoTen}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                        <input
                          type="tel"
                          name="dienThoai"
                          value={formData.dienThoai}
                          onChange={handleInputChange}
                          placeholder="0912345678"
                          className={`input-cute pl-12 ${errors.dienThoai ? 'border-red-400' : ''}`}
                        />
                      </div>
                      {errors.dienThoai && (
                        <p className="mt-1 text-xs text-red-500">⚠️ {errors.dienThoai}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className={`input-cute pl-12 ${errors.email ? 'border-red-400' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">⚠️ {errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ giao hàng <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-primary-400" size={18} />
                      <textarea
                        name="diaChiGiaoHang"
                        value={formData.diaChiGiaoHang}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        rows="3"
                        className={`input-cute pl-12 ${errors.diaChiGiaoHang ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {errors.diaChiGiaoHang && (
                      <p className="mt-1 text-xs text-red-500">⚠️ {errors.diaChiGiaoHang}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white rounded-bubble shadow-soft border-2 border-primary-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard size={24} className="text-primary-500" />
                  Phương Thức Thanh Toán
                </h3>
                
                <div className="space-y-3">
                  <label className={`flex items-start gap-4 p-4 rounded-cute border-2 cursor-pointer transition-all ${
                    formData.phuongThucThanhToanId === 1 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300'
                  }`}>
                    <input
                      type="radio"
                      name="phuongThucThanhToanId"
                      value="1"
                      checked={formData.phuongThucThanhToanId === 1}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phuongThucThanhToanId: parseInt(e.target.value)
                      }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💵</span>
                        <strong className="text-gray-800">Thanh toán khi nhận hàng (COD)</strong>
                      </div>
                      <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-cute border-2 cursor-pointer transition-all ${
                    formData.phuongThucThanhToanId === 2 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300'
                  }`}>
                    <input
                      type="radio"
                      name="phuongThucThanhToanId"
                      value="2"
                      checked={formData.phuongThucThanhToanId === 2}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phuongThucThanhToanId: parseInt(e.target.value)
                      }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🏦</span>
                        <strong className="text-gray-800">Thanh toán qua VNPay</strong>
                      </div>
                      <p className="text-sm text-gray-600">Thanh toán online qua cổng VNPay (ATM, Visa, MasterCard)</p>
                    </div>
                  </label>
                </div>

                {formData.phuongThucThanhToanId === 2 && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-cute">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">ℹ️</span>
                      <div>
                        <strong className="text-blue-800 block mb-1">Thanh toán qua VNPay</strong>
                        <p className="text-sm text-blue-700">
                          Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch.
                          Hỗ trợ thanh toán qua thẻ ATM, Visa, MasterCard.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div className="bg-white rounded-bubble shadow-soft border-2 border-primary-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={24} className="text-primary-500" />
                  Ghi Chú
                </h3>
                <textarea
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về đơn hàng (tùy chọn)"
                  rows="3"
                  className="input-cute"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/cart')}
                  disabled={submitting}
                  icon={<ArrowLeft size={20} />}
                >
                  Quay lại giỏ hàng
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={submitting}
                  loading={submitting}
                  icon={formData.phuongThucThanhToanId === 2 ? <CreditCard size={20} /> : <Check size={20} />}
                >
                  {submitting ? 'Đang xử lý...' : formData.phuongThucThanhToanId === 2 ? 'Thanh toán VNPay' : 'Đặt hàng ngay'}
                </Button>
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary-50 to-rose-50 rounded-bubble shadow-bubble border-2 border-primary-200 p-6 sticky top-24">
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-6">
                📦 Thông Tin Đơn Hàng
              </h3>
              
              {/* Products */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Sản phẩm ({getTotalItems()} sản phẩm)
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.ID} className="flex gap-3 p-3 bg-white rounded-cute border border-primary-100">
                      <img
                        src={buildImageUrl(item.sanPham?.HinhAnhURL)}
                        alt={item.sanPham?.Ten}
                        className="w-16 h-16 object-cover rounded-cute flex-shrink-0"
                        onError={handleImageError}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm line-clamp-1">
                          {item.sanPham?.Ten}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Số lượng: {item.SoLuong}
                        </div>
                        <div className="text-sm font-bold text-primary-600 mt-1">
                          {(parseFloat(item.DonGia) * item.SoLuong).toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-primary-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-gradient-primary">
                    {calculateTotal().toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-4 border-t-2 border-primary-200">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Truck size={20} className="text-primary-500" />
                  <span>Giao hàng tận nơi</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <RefreshCw size={20} className="text-primary-500" />
                  <span>Đổi trả trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Shield size={20} className="text-primary-500" />
                  <span>Hàng chính hãng 100%</span>
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

export default CheckoutPage;
