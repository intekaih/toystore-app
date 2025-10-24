import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder } from '../../api/order.api';
import { Button, Loading, ErrorMessage } from '../../components/common';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalAmount, loading: cartLoading, clearCart } = useCart();

  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || user?.HoTen || '',
    email: user?.email || user?.Email || '',
    dienThoai: user?.dienThoai || user?.DienThoai || '',
    diaChiGiaoHang: '',
    ghiChu: '',
    phuongThucThanhToanId: 1,
  });

  const [paymentMethods] = useState([
    { id: 1, ten: 'Tiền mặt', moTa: 'Thanh toán khi nhận hàng (COD)' },
    { id: 2, ten: 'Chuyển khoản', moTa: 'Chuyển khoản ngân hàng' },
    { id: 3, ten: 'VNPay', moTa: 'Thanh toán qua VNPay' },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0 && !cartLoading) {
      showMessage('Giỏ hàng trống, vui lòng thêm sản phẩm', 'warning');
      setTimeout(() => navigate('/products'), 2000);
    }
  }, [user, cartItems, cartLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Xóa error của field đang được chỉnh sửa
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // ✅ Validate họ tên
    if (!formData.hoTen || !formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên không được để trống';
    } else if (formData.hoTen.trim().length < 2) {
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // ✅ Validate email
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // ✅ Validate số điện thoại
    if (!formData.dienThoai || !formData.dienThoai.trim()) {
      newErrors.dienThoai = 'Số điện thoại không được để trống';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.dienThoai.replace(/\s/g, ''))) {
      newErrors.dienThoai = 'Số điện thoại không hợp lệ';
    }

    // ✅ Validate địa chỉ
    if (!formData.diaChiGiaoHang || !formData.diaChiGiaoHang.trim()) {
      newErrors.diaChiGiaoHang = 'Địa chỉ giao hàng không được để trống';
    } else if (formData.diaChiGiaoHang.trim().length < 10) {
      newErrors.diaChiGiaoHang = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showMessage('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    try {
      setLoading(true);

      console.log('🛒 Submitting order data:', formData);

      // Gọi API tạo đơn hàng
      const response = await createOrder(formData);

      console.log('✅ Order created:', response);

      if (response.success) {
        // Xóa giỏ hàng trong context
        await clearCart();

        // Hiển thị thông báo thành công
        showMessage('Đặt hàng thành công! Đang chuyển hướng...', 'success');

        // ✅ REDIRECT VỀ TRANG LỊCH SỬ ĐƠN HÀNG SAU 2 GIÂY
        setTimeout(() => {
          navigate('/orders', { 
            state: { 
              orderCreated: true,
              orderId: response.data.hoaDon.id,
              orderCode: response.data.hoaDon.maHD
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      showMessage(
        error.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  if (cartLoading) {
    return <Loading fullScreen text="Đang tải giỏ hàng..." />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <ErrorMessage message="Giỏ hàng trống" type="warning" />
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate('/products')}
          >
            🛍️ Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>💳 Thanh toán đơn hàng</h1>

        {message && (
          <ErrorMessage
            message={message}
            type={messageType}
            onClose={() => setMessage('')}
          />
        )}

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-content">
            {/* Thông tin người nhận */}
            <div className="checkout-main">
              <div className="section-card">
                <h3>👤 Thông tin người nhận</h3>

                <div className="input-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên"
                    disabled={loading}
                    style={{
                      borderColor: errors.hoTen ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  {errors.hoTen && <span className="error">{errors.hoTen}</span>}
                </div>

                <div className="input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    disabled={loading}
                    style={{
                      borderColor: errors.email ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="input-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="dienThoai"
                    value={formData.dienThoai}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    disabled={loading}
                    style={{
                      borderColor: errors.dienThoai ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  {errors.dienThoai && <span className="error">{errors.dienThoai}</span>}
                </div>

                <div className="input-group">
                  <label>Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    name="diaChiGiaoHang"
                    value={formData.diaChiGiaoHang}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    disabled={loading}
                    style={{
                      borderColor: errors.diaChiGiaoHang ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  {errors.diaChiGiaoHang && <span className="error">{errors.diaChiGiaoHang}</span>}
                </div>

                <div className="input-group">
                  <label>Ghi chú (tùy chọn)</label>
                  <textarea
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm cho đơn hàng..."
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="section-card">
                <h3>💰 Phương thức thanh toán</h3>
                <div className="payment-methods">
                  {paymentMethods.map(method => (
                    <label key={method.id} className="payment-method">
                      <input
                        type="radio"
                        name="phuongThucThanhToanId"
                        value={method.id}
                        checked={formData.phuongThucThanhToanId === method.id}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phuongThucThanhToanId: parseInt(e.target.value)
                        }))}
                        disabled={loading}
                      />
                      <div className="payment-method-info">
                        <strong>{method.ten}</strong>
                        <small>{method.moTa}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="checkout-sidebar">
              <div className="section-card order-summary">
                <h3>📋 Đơn hàng của bạn</h3>

                <div className="order-items">
                  {cartItems.map(item => (
                    <div key={item.sanPhamId} className="order-item">
                      <div className="order-item-image">
                        <img src={item.hinhAnh || '/placeholder.jpg'} alt={item.tenSanPham} />
                      </div>
                      <div className="order-item-info">
                        <h4>{item.tenSanPham}</h4>
                        <p>x{item.soLuong}</p>
                      </div>
                      <div className="order-item-price">
                        {(item.giaBan * item.soLuong).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Tạm tính:</span>
                    <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="total-row">
                    <span>Phí vận chuyển:</span>
                    <span className="free">Miễn phí</span>
                  </div>
                  <div className="total-divider"></div>
                  <div className="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={loading}
                  disabled={loading || cartItems.length === 0}
                >
                  ✅ Đặt hàng
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="medium"
                  fullWidth
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  ← Quay lại giỏ hàng
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
