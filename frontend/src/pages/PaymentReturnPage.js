import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentReturnPage.css';

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    processPaymentResult();
  }, []);

  const processPaymentResult = () => {
    try {
      setLoading(true);

      // Lấy params từ URL (backend đã redirect với params)
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

      console.log('Payment params:', {
        success,
        orderId,
        orderCode,
        amount,
        transactionNo,
        bankCode,
        payDate,
        responseCode,
        message
      });

      if (success) {
        // Thanh toán thành công
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
            payDate
          }
        });
      } else {
        // Thanh toán thất bại
        setPaymentResult({
          success: false,
          code: responseCode || '99',
          message: message ? decodeURIComponent(message) : 'Thanh toán thất bại',
          data: {
            txnRef,
            amount
          }
        });
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
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h2>

          {/* Message */}
          <p className="result-message">
            {paymentResult?.message || 'Không có thông tin'}
          </p>

          {/* Payment details */}
          {paymentResult?.data && (
            <div className="payment-details">
              <h3>📋 Thông tin giao dịch</h3>
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">
                  {paymentResult.data.orderCode || paymentResult.data.orderId}
                </span>
              </div>
              {paymentResult.data.transactionNo && (
                <div className="detail-row">
                  <span className="detail-label">Mã giao dịch VNPay:</span>
                  <span className="detail-value">{paymentResult.data.transactionNo}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value amount">
                  {parseFloat(paymentResult.data.amount).toLocaleString('vi-VN')} ₫
                </span>
              </div>
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
                <span>Đơn hàng đã được thanh toán thành công qua VNPay</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📦</span>
                <span>Đơn hàng sẽ được xử lý và giao đến bạn sớm nhất</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📱</span>
                <span>Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="result-actions">
            {isSuccess ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/orders')}
                >
                  📋 Xem đơn hàng của tôi
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
