import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService, orderService } from '../services';
import config from '../config';
import { CheckCircle2, XCircle, Loader2, Package, CreditCard, Clock, ArrowRight, Home, ShoppingCart, AlertCircle } from 'lucide-react';

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({ 
    subtotal: 0, 
    vat: { rate: 0, amount: 0 },
    shipping: 0, 
    voucher: { discountAmount: 0 },
    total: 0 
  });
  
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!hasProcessedRef.current) {
      hasProcessedRef.current = true;
      processPaymentResult();
    }
  }, []);

  // Fetch order details khi có orderCode/orderId
  useEffect(() => {
    if (paymentResult?.data?.orderCode || paymentResult?.data?.orderId) {
      loadOrderDetails();
    } else {
      // Nếu không có orderCode, thử parse cartItems từ URL (khi thất bại)
      const cartItemsJson = searchParams.get('cartItems');
      if (cartItemsJson && !paymentResult?.success) {
        try {
          const items = JSON.parse(cartItemsJson);
          // Đảm bảo items có đầy đủ thông tin, đặc biệt là image
          const formattedItems = items.map(item => ({
            id: item.id || item.ID,
            name: item.name || item.ten || item.Ten || 'Sản phẩm',
            price: parseFloat(item.price || item.gia || item.Gia || 0),
            quantity: parseInt(item.quantity || item.soLuong || item.SoLuong || 1),
            image: item.image || item.hinhAnh || item.HinhAnh || item.hinhAnhURL || item.HinhAnhURL || '',
            total: parseFloat(item.price || item.gia || item.Gia || 0) * parseInt(item.quantity || item.soLuong || item.SoLuong || 1)
          }));
          setOrderItems(formattedItems);
          calculateSummary(formattedItems);
        } catch (e) {
          console.error('Error parsing cartItems:', e);
        }
      } else if (paymentResult?.data?.amount && orderItems.length === 0) {
        // Fallback: nếu chỉ có amount, tạo summary đơn giản
        const amount = parseFloat(paymentResult.data.amount);
        setOrderSummary({ 
          subtotal: amount, 
          vat: { rate: 0, amount: 0 },
          shipping: 0, 
          voucher: { discountAmount: 0 },
          total: amount 
        });
      }
    }
  }, [paymentResult]);

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

  // Load order details từ API
  const loadOrderDetails = async () => {
    try {
      const orderCode = paymentResult?.data?.orderCode;
      if (!orderCode) return;

      const response = await orderService.getOrderByCode(orderCode);
      if (response.success && response.data?.hoaDon) {
        const order = response.data.hoaDon;
        setOrderDetails(order);
        
        // Map order items - xử lý cả camelCase và PascalCase
        const chiTiet = order.chiTiet || order.ChiTiet || [];
        const items = chiTiet.map(item => {
          const sanPham = item.sanPham || item.SanPham || {};
          
          // Lấy ảnh từ nhiều nguồn khác nhau
          const imageRaw = sanPham.HinhAnhURL || sanPham.hinhAnhURL || 
                          sanPham.hinhAnh || sanPham.HinhAnh || 
                          sanPham.image || item.hinhAnh || item.image || '';
          
          const mappedItem = {
            id: sanPham.ID || sanPham.id || item.sanPhamID || item.SanPhamID,
            name: sanPham.Ten || sanPham.ten || item.tenSanPham || 'Sản phẩm',
            price: parseFloat(item.donGia || item.DonGia || 0),
            quantity: parseInt(item.soLuong || item.SoLuong || 1),
            image: imageRaw,
            total: parseFloat(item.donGia || item.DonGia || 0) * parseInt(item.soLuong || item.SoLuong || 1)
          };
          
          console.log('📸 Mapping order item:', {
            sanPham: sanPham,
            imageRaw: imageRaw,
            mappedItem: mappedItem
          });
          
          return mappedItem;
        });
        
        console.log('📦 All mapped items:', items);
        setOrderItems(items);
        
        // Calculate summary với đầy đủ các trường phí
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const priceBreakdown = order.priceBreakdown || order.PriceBreakdown || {};
        
        // VAT
        const vat = {
          rate: parseFloat(priceBreakdown.vat?.rate || priceBreakdown.VAT?.rate || 0),
          amount: parseFloat(priceBreakdown.vat?.amount || priceBreakdown.VAT?.amount || 0)
        };
        
        // Shipping
        const shipping = parseFloat(priceBreakdown.shipping?.fee || priceBreakdown.Shipping?.fee || 0);
        
        // Voucher discount
        const voucher = {
          discountAmount: parseFloat(priceBreakdown.voucher?.discountAmount || priceBreakdown.Voucher?.discountAmount || 0)
        };
        
        // Total
        const total = parseFloat(order.tongTien || order.TongTien || order.ThanhTien || (subtotal + vat.amount + shipping - voucher.discountAmount));
        
        setOrderSummary({ 
          subtotal, 
          vat, 
          shipping, 
          voucher, 
          total 
        });
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      // Fallback: sử dụng amount từ paymentResult
      if (paymentResult?.data?.amount) {
        const amount = parseFloat(paymentResult.data.amount);
        setOrderSummary({ 
          subtotal: amount, 
          vat: { rate: 0, amount: 0 },
          shipping: 0, 
          voucher: { discountAmount: 0 },
          total: amount 
        });
      }
    }
  };

  // Calculate summary từ cart items
  const calculateSummary = (items) => {
    if (!items || items.length === 0) return;
    
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1)), 0);
    const vat = {
      rate: 0.1, // 10% default
      amount: subtotal * 0.1
    };
    const shipping = 30000; // Default shipping fee
    const voucher = {
      discountAmount: 0
    };
    const total = subtotal + vat.amount + shipping - voucher.discountAmount;
    
    setOrderSummary({ 
      subtotal, 
      vat, 
      shipping, 
      voucher, 
      total 
    });
  };

  // Build image URL - giống với ProductCard và các component khác
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    
    // Nếu đã là full URL (http/https)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const API_BASE_URL = config.API_BASE_URL;
    
    // Nếu bắt đầu với /uploads/
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Nếu chỉ là filename (không bắt đầu với /)
    if (!imagePath.startsWith('/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    
    // Fallback
    return '/barbie.jpg';
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-cute shadow-cute p-8 md:p-12 max-w-2xl w-full text-center">
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý kết quả thanh toán...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu không có kết quả
  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-cute shadow-cute p-8 md:p-12 max-w-4xl w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Left: Icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-14 h-14 text-red-500" />
              </div>
            </div>
            
            {/* Right: Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Không có thông tin thanh toán</h2>
              <p className="text-gray-600 mb-6">Không tìm thấy thông tin giao dịch</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button 
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Quay lại giỏ hàng
                </button>
                <button 
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-5 h-5" />
                  Về trang chủ
                </button>
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 flex items-center justify-center p-4 py-8">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Payment Status */}
        <div className="bg-white rounded-cute shadow-cute p-6 md:p-8">
          {/* Icon */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto ${
            isSuccess ? 'bg-green-100' : 'bg-primary-100'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            ) : (
              <AlertCircle className="w-14 h-14 text-primary-600 font-bold" />
            )}
          </div>
          
          {/* Title */}
          <h2 className={`text-3xl font-bold mb-3 text-center lg:text-left ${
            isSuccess ? 'text-green-600' : 'text-gray-800'
          }`}>
            {isSuccess ? (isCOD ? 'Đặt hàng thành công!' : 'Thanh toán thành công!') : 'Thanh toán thất bại'}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 mb-6 text-center lg:text-left">
            {isSuccess 
              ? (isCOD ? 'Đơn hàng của bạn đã được đặt thành công.' : 'Giao dịch của bạn đã được thanh toán thành công.')
              : (paymentResult?.message || 'Rất tiếc, giao dịch của bạn không thể hoàn tất.')
            }
          </p>

          {/* Reason box (chỉ hiển thị khi thất bại) */}
          {!isSuccess && paymentResult?.message && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">Lý do:</p>
              <p className="text-sm text-gray-700">{paymentResult.message}</p>
            </div>
          )}

          {/* Success info (chỉ hiển thị khi thành công) */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-800">
                    {isCOD 
                      ? 'Đơn hàng đã được đặt thành công với hình thức thanh toán COD' 
                      : 'Đơn hàng đã được thanh toán thành công qua VNPay'
                    }
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-800">Đơn hàng sẽ được xử lý và giao đến bạn sớm nhất</span>
                </div>
                {isCOD && (
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800">Bạn sẽ thanh toán khi nhận hàng</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isSuccess ? (
              <>
                <button 
                  className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-soft hover:shadow-cute"
                  onClick={() => {
                    if (!user && paymentResult.data.orderCode) {
                      navigate(`/order/${paymentResult.data.orderCode}`);
                    } else {
                      navigate('/orders');
                    }
                  }}
                >
                  <Package className="w-5 h-5" />
                  Xem đơn hàng
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  className="w-full px-6 py-3 bg-white border-2 border-primary-300 hover:border-primary-400 text-primary-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-5 h-5" />
                  Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <>
                <button 
                  className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-soft hover:shadow-cute"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thử lại thanh toán
                </button>
                <button 
                  className="w-full px-6 py-3 bg-white border-2 border-primary-300 hover:border-primary-400 text-primary-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate('/cart')}
                >
                  Chọn phương thức khác
                </button>
              </>
            )}
          </div>

          {/* Help link */}
          <p className="text-sm text-gray-500 text-center lg:text-left mt-6">
            Cần trợ giúp? <a href="/contact" className="text-primary-600 hover:underline">Liên hệ với chúng tôi</a>
          </p>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white rounded-cute shadow-cute p-6 md:p-8 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Tóm tắt đơn hàng</h3>
          
          {/* Order Items */}
          {orderItems.length > 0 ? (
            <div className="space-y-4 mb-6">
              {orderItems.map((item, index) => {
                const imageUrl = buildImageUrl(item.image);
                console.log('🖼️ Rendering item:', { item, imageUrl, originalImage: item.image });
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                          console.error('❌ Image load error:', {
                            imageUrl,
                            originalImage: item.image,
                            item: item,
                            error: e
                          });
                          e.target.src = '/barbie.jpg'; 
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', imageUrl);
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Không có thông tin sản phẩm</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Summary */}
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tạm tính</span>
              <span className="text-gray-800 font-semibold">{formatPrice(orderSummary.subtotal)}</span>
            </div>
            
            {/* VAT */}
            {orderSummary.vat && orderSummary.vat.amount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  Thuế VAT
                  {orderSummary.vat.rate > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      {(orderSummary.vat.rate * 100).toFixed(0)}%
                    </span>
                  )}
                </span>
                <span className="text-gray-800 font-semibold text-blue-600">
                  +{formatPrice(orderSummary.vat.amount)}
                </span>
              </div>
            )}
            
            {/* Shipping */}
            {orderSummary.shipping > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-gray-800 font-semibold">{formatPrice(orderSummary.shipping)}</span>
              </div>
            )}
            
            {/* Voucher Discount */}
            {orderSummary.voucher && orderSummary.voucher.discountAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Giảm giá</span>
                <span className="text-gray-800 font-semibold text-red-600">
                  -{formatPrice(orderSummary.voucher.discountAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
            <span className="text-xl font-bold text-primary-600">{formatPrice(orderSummary.total)}</span>
          </div>

          {/* Payment Method Info */}
          {paymentResult?.data?.paymentMethod && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span>Phương thức: <span className="font-semibold text-gray-800">{paymentResult.data.paymentMethod}</span></span>
              </div>
              {paymentResult.data.orderCode && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Package className="w-4 h-4" />
                  <span>Mã đơn: <span className="font-semibold text-gray-800">{paymentResult.data.orderCode}</span></span>
                </div>
              )}
            </div>
          )}
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
