import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import * as orderApi from '../../api/order.api';
import { formatCurrency } from '../../utils/format';
import { Button, Loading, ErrorMessage, Input } from '../../components/common';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || '',
    email: user?.email || '',
    dienThoai: user?.dienThoai || '',
    diaChi: '',
    ghiChu: '',
    phuongThucThanhToanID: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    loadPaymentMethods();
  }, [user, cartItems, navigate]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await orderApi.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setFormData(prev => ({
          ...prev,
          phuongThucThanhToanID: methods[0].id
        }));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.hoTen || !formData.dienThoai || !formData.diaChi) {
      setMessage('Vui lòng điền đầy đủ thông tin giao hàng');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        KhachHangID: user.id,
        PhuongThucThanhToanID: parseInt(formData.phuongThucThanhToanID),
        GhiChu: formData.ghiChu || '',
        ThongTinGiaoHang: {
          HoTen: formData.hoTen,
          Email: formData.email,
          DienThoai: formData.dienThoai,
          DiaChi: formData.diaChi,
        }
      };

      const result = await orderApi.createOrder(orderData);
      
      await clearCart();
      
      setMessage('Đặt hàng thành công!');
      setMessageType('success');

      setTimeout(() => {
        navigate(`/orders/${result.order.id}`);
      }, 1500);

    } catch (error) {
      setMessage(error.message || 'Có lỗi xảy ra khi đặt hàng');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return <Loading fullScreen />;
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

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-content">
            {/* Thông tin giao hàng */}
            <div className="checkout-section">
              <div className="section-card">
                <h3>📦 Thông tin giao hàng</h3>
                
                <Input
                  name="hoTen"
                  label="Họ tên người nhận"
                  value={formData.hoTen}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên"
                  required
                />

                <Input
                  name="dienThoai"
                  type="tel"
                  label="Số điện thoại"
                  value={formData.dienThoai}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  required
                />

                <Input
                  name="email"
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                />

                <div className="input-group">
                  <label>Địa chỉ giao hàng *</label>
                  <textarea
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ chi tiết"
                    rows="3"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Ghi chú đơn hàng</label>
                  <textarea
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleInputChange}
                    placeholder="Ghi chú cho người bán (tùy chọn)"
                    rows="3"
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
                        name="phuongThucThanhToanID"
                        value={method.id}
                        checked={formData.phuongThucThanhToanID === method.id}
                        onChange={handleInputChange}
                      />
                      <span className="payment-method-info">
                        <strong>{method.ten}</strong>
                        {method.moTa && <small>{method.moTa}</small>}
                      </span>
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
                    <div key={item.id} className="order-item">
                      <div className="order-item-image">
                        <img src={item.hinhAnh || '/placeholder.jpg'} alt={item.tenSanPham} />
                      </div>
                      <div className="order-item-info">
                        <h4>{item.tenSanPham}</h4>
                        <p>Số lượng: {item.soLuong}</p>
                      </div>
                      <div className="order-item-price">
                        {formatCurrency(item.giaBan * item.soLuong)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="total-row">
                    <span>Phí vận chuyển:</span>
                    <span className="free">Miễn phí</span>
                  </div>
                  <div className="total-divider"></div>
                  <div className="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
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
