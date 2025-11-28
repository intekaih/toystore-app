import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService } from '../services'; // ✅ Sử dụng cartService
import './PaymentReturnPage.css';

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [restoring, setRestoring] = useState(false);
  
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!hasProcessedRef.current) {
      hasProcessedRef.current = true;
      processPaymentResult();
    }
  }, []);

  const processPaymentResult = async () => {
    try {
      setLoading(true);

      // ✅ ƯU TIÊN: Kiểm tra dữ liệu từ state (COD) trước
      const stateData = location.state;
      
      if (stateData && stateData.success !== undefined) {
        // 🎯 DỮ LIỆU TỪ STATE (COD)
        console.log('📦 COD Payment Data:', stateData);
        
        if (stateData.success) {
          setPaymentResult({
            success: true,
            code: '00',
            message: stateData.message || 'Đặt hàng thành công',
            data: {
              orderId: stateData.orderId,
              orderCode: stateData.orderCode,
              amount: stateData.amount,
              paymentMethod: stateData.paymentMethod || 'COD'
            }
          });

          // ✅ XÓA GIỎ HÀNG SAU KHI ĐẶT HÀNG COD THÀNH CÔNG
          try {
            await cartService.clearCart();
            console.log('✅ Đã xóa giỏ hàng sau khi đặt hàng COD thành công');
          } catch (cartError) {
            // ⚠️ Không throw error nếu xóa giỏ hàng thất bại - Đơn hàng đã được xử lý thành công
            console.warn('⚠️ Không thể xóa giỏ hàng (không ảnh hưởng đến đơn hàng):', cartError.message);
          }
        } else {
          setPaymentResult({
            success: false,
            code: '99',
            message: stateData.message || 'Đặt hàng thất bại',
            data: {
              orderId: stateData.orderId,
              orderCode: stateData.orderCode,
              amount: stateData.amount
            }
          });
        }
      } else {
        // 💳 DỮ LIỆU TỪ URL PARAMS (VNPay)
        const success = searchParams.get('success') === 'true';
        const orderId = searchParams.get('orderId');
        const orderCode = searchParams.get('orderCode');
        const amount = searchParams.get('amount');
        const transactionNo = searchParams.get('transactionNo');
        const bankCode = searchParams.get('bankCode');
        const payDate = searchParams.get('payDate');
        const responseCode = searchParams.get('responseCode');
        const message = searchParams.get('message');
        const txnRef = searchParams.get('txnRef');
        const cartItemsJson = searchParams.get('cartItems');

        if (success) {
          setPaymentResult({
            success: true,
            code: '00',
            message: 'Thanh toán thành công',
            data: {
              orderId,
              orderCode,
              amount,
              transactionNo,
              bankCode,
              payDate,
              paymentMethod: 'VNPay'
            }
          });

          // ✅ XÓA GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
          try {
            await cartService.clearCart();
            console.log('✅ Đã xóa giỏ hàng sau khi thanh toán thành công');
          } catch (cartError) {
            // ⚠️ Không throw error nếu xóa giỏ hàng thất bại - Đơn hàng đã được xử lý thành công
            console.warn('⚠️ Không thể xóa giỏ hàng (không ảnh hưởng đến đơn hàng):', cartError.message);
          }
        } else {
          setPaymentResult({
            success: false,
            code: responseCode || '99',
            message: message ? decodeURIComponent(message) : 'Thanh toán thất bại',
            data: {
              txnRef,
              amount,
              orderId,
              orderCode
            }
          });

          // Khôi phục giỏ hàng cho guest user
          if (!user && cartItemsJson) {
            await handleRestoreGuestCart(cartItemsJson);
          }
        }
      }
    } catch (error) {
      console.error('Error processing payment result:', error);
      setPaymentResult({
        success: false,
        message: 'Không thể xử lý kết quả thanh toán'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function để format giá tiền an toàn
  const formatPrice = (price) => {
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
        console.warn('Invalid price value:', price);
        return '0 ₫';
      }
      return numPrice.toLocaleString('vi-VN') + ' ₫';
    } catch (error) {
      console.error('Error formatting price:', error, price);
      return '0 ₫';
    }
  };

  /**
   * Khôi phục giỏ hàng guest sau khi thanh toán thất bại
   */
  const handleRestoreGuestCart = async (cartItemsJson) => {
    try {
      setRestoring(true);

      // Parse cart items từ JSON string
      const cartItems = JSON.parse(cartItemsJson);
      
      if (!cartItems || cartItems.length === 0) {
        return;
      }

      // ✅ Sử dụng cartService thay vì import API trực tiếp
      const result = await cartService.restoreGuestCart(cartItems);

      // Hiển thị thông báo thành công
      if (result.success && result.data.totalRestored > 0) {
        console.log(`✅ Đã khôi phục ${result.data.totalRestored}/${cartItems.length} sản phẩm vào giỏ hàng`);
      }

      if (result.data.totalErrors > 0) {
        console.warn(`⚠️ Có ${result.data.totalErrors} sản phẩm không thể khôi phục:`, result.data.errors);
      }

    } catch (error) {
      console.error('❌ Lỗi khôi phục giỏ hàng:', error);
      // Không hiển thị lỗi cho user - vì đây là background process
    } finally {
      setRestoring(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="payment-return-page">
        <div className="payment-return-container">
          <div className="payment-loading">
            <div className="loading-spinner-large"></div>
            <h2>🔍 Đang xử lý kết quả thanh toán...</h2>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu không có kết quả
  if (!paymentResult) {
    return (
      <div className="payment-return-page">
        <div className="payment-return-container">
          <div className="payment-result payment-error">
            <div className="result-icon">❌</div>
            <h2>Không có thông tin thanh toán</h2>
            <p className="result-message">Không tìm thấy thông tin giao dịch</p>
            
            <div className="result-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/cart')}
              >
                Quay lại giỏ hàng
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị kết quả thanh toán
  const isSuccess = paymentResult?.success && paymentResult?.code === '00';
  const isCOD = paymentResult?.data?.paymentMethod === 'COD';

  return (
    <div className="payment-return-page">
      <div className="payment-return-container">
        <div className={`payment-result ${isSuccess ? 'payment-success' : 'payment-failed'}`}>
          {/* Icon */}
          <div className="result-icon">
            {isSuccess ? '✅' : '❌'}
          </div>

          {/* Title */}
          <h2>
            {isSuccess ? (isCOD ? 'Đặt hàng thành công!' : 'Thanh toán thành công!') : 'Thanh toán thất bại'}
          </h2>

          {/* Message */}
          <p className="result-message">
            {paymentResult?.message || 'Không có thông tin'}
          </p>

          {/* Payment details - CHỈ HIỂN THỊ NẾU CÓ DỮ LIỆU */}
          {paymentResult?.data && (paymentResult.data.orderCode || paymentResult.data.orderId || paymentResult.data.amount) && (
            <div className="payment-details">
              <h3>📋 Thông tin giao dịch</h3>
              {(paymentResult.data.orderCode || paymentResult.data.orderId) && (
                <div className="detail-row">
                  <span className="detail-label">Mã đơn hàng:</span>
                  <span className="detail-value">
                    {paymentResult.data.orderCode || paymentResult.data.orderId || 'Không xác định'}
                  </span>
                </div>
              )}
              {paymentResult.data.paymentMethod && (
                <div className="detail-row">
                  <span className="detail-label">Phương thức:</span>
                  <span className="detail-value">{paymentResult.data.paymentMethod}</span>
                </div>
              )}
              {paymentResult.data.transactionNo && (
                <div className="detail-row">
                  <span className="detail-label">Mã giao dịch VNPay:</span>
                  <span className="detail-value">{paymentResult.data.transactionNo}</span>
                </div>
              )}
              {paymentResult.data.amount && (
                <div className="detail-row">
                  <span className="detail-label">Số tiền:</span>
                  <span className="detail-value amount">
                    {formatPrice(paymentResult.data.amount)}
                  </span>
                </div>
              )}
              {paymentResult.data.bankCode && (
                <div className="detail-row">
                  <span className="detail-label">Ngân hàng:</span>
                  <span className="detail-value">{paymentResult.data.bankCode}</span>
              </div>
              )}
              {paymentResult.data.payDate && (
                <div className="detail-row">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-value">
                    {formatPayDate(paymentResult.data.payDate)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Success info */}
          {isSuccess && (
            <div className="success-info">
              <div className="info-item">
                <span className="info-icon">✅</span>
                <span>
                  {isCOD 
                    ? 'Đơn hàng đã được đặt thành công với hình thức thanh toán COD' 
                    : 'Đơn hàng đã được thanh toán thành công qua VNPay'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-icon">📦</span>
                <span>Đơn hàng sẽ được xử lý và giao đến bạn sớm nhất</span>
              </div>
              {isCOD && (
                <div className="info-item">
                  <span className="info-icon">💵</span>
                  <span>Bạn sẽ thanh toán khi nhận hàng</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-icon">📱</span>
                <span>Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"</span>
              </div>
            </div>
          )}

          {/* ✨ Thông báo khôi phục giỏ hàng khi thất bại */}
          {!isSuccess && (
            <div className="success-info" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
              <div className="info-item">
                <span className="info-icon">🛒</span>
                <span>Sản phẩm đã được khôi phục vào giỏ hàng của bạn</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💡</span>
                <span>Bạn có thể thử thanh toán lại hoặc chọn phương thức khác</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="result-actions">
            {isSuccess ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    if (!user && paymentResult.data.orderCode) {
                      navigate(`/order/${paymentResult.data.orderCode}`);
                    } else {
                      navigate('/orders');
                    }
                  }}
                >
                  📋 Xem đơn hàng
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  🏠 Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/cart')}
                >
                  ← Quay lại giỏ hàng
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  🏠 Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function để format pay date từ VNPay (yyyyMMddHHmmss)
const formatPayDate = (payDate) => {
  if (!payDate || payDate.length !== 14) return payDate;
  
  const year = payDate.substring(0, 4);
  const month = payDate.substring(4, 6);
  const day = payDate.substring(6, 8);
  const hour = payDate.substring(8, 10);
  const minute = payDate.substring(10, 12);
  const second = payDate.substring(12, 14);
  
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

export default PaymentReturnPage;
