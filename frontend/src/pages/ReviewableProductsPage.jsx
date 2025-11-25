import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Star, Calendar, MessageSquare, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import reviewService from '../services/reviewService';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';

/**
 * ReviewableProductsPage - THIẾT KẾ MỚI
 * Trang danh sách sản phẩm có thể đánh giá (từ đơn hàng hoàn thành)
 */
const ReviewableProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load sản phẩm có thể đánh giá
  useEffect(() => {
    loadReviewableProducts();
  }, []);

  const loadReviewableProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await reviewService.getReviewableProducts();
      if (result.success) {
        setProducts(result.products);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click đánh giá
  const handleReviewClick = (product) => {
    setSelectedProduct(product);
    setShowReviewForm(true);
  };

  // Xử lý thành công
  const handleReviewSuccess = (review) => {
    setShowReviewForm(false);
    setSelectedProduct(null);
    // Reload danh sách
    loadReviewableProducts();
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4"></div>
              <Star className="w-8 h-8 text-pink-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 font-semibold">Đang tải danh sách...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* ✅ Back Button - Nút quay lại đẹp hơn */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-pink-600 hover:text-pink-700 font-semibold transition-all hover:bg-pink-50 rounded-full"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        {/* Header - Thiết kế mới */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-800 mb-3 flex items-center gap-3">
            <span className="text-5xl">⭐</span>
            Đánh giá sản phẩm
          </h1>
          <p className="text-gray-600 text-lg">
            Hãy chia sẻ trải nghiệm của bạn với các sản phẩm đã mua
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-4 mb-6 shadow-soft">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <ReviewForm
                sanPhamId={selectedProduct.sanPham.id}
                sanPhamInfo={{
                  ten: selectedProduct.sanPham.ten,
                  hinhAnh: selectedProduct.sanPham.hinhAnh,
                  giaBan: selectedProduct.sanPham.giaBan
                }}
                onSuccess={handleReviewSuccess}
                onCancel={() => {
                  setShowReviewForm(false);
                  setSelectedProduct(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Products List */}
        {products.length === 0 ? (
          // Empty State - Thiết kế đẹp
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-soft p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Không có sản phẩm nào để đánh giá
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn chưa có đơn hàng hoàn thành hoặc đã đánh giá tất cả sản phẩm
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 inline-flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {products.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-200 shadow-soft hover:shadow-lg p-6 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  {/* Product Info */}
                  <div className="flex gap-5 flex-1 w-full">
                    {/* Image - Bo tròn đẹp hơn */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.sanPham.hinhAnh}
                        alt={item.sanPham.ten}
                        className="w-28 h-28 object-cover rounded-2xl border-2 border-pink-100 shadow-sm"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-md">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 hover:text-pink-600 cursor-pointer transition-colors line-clamp-2">
                        {item.sanPham.ten}
                      </h3>
                      <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-3">
                        {item.sanPham.giaBan.toLocaleString('vi-VN')}₫
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-full border border-pink-200">
                          <Package className="w-4 h-4 text-pink-500" />
                          <span className="font-semibold text-gray-700">Số lượng: {item.sanPham.soLuongDaMua}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-700">{new Date(item.ngayLap).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button - Đẹp hơn */}
                  <div className="flex flex-col items-center gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleReviewClick(item)}
                      className="w-full lg:w-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Star className="w-5 h-5 fill-white" />
                      Đánh giá ngay
                    </button>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Mã đơn:</span>
                      <span className="font-mono font-bold text-pink-600">{item.maHD}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box - Thiết kế mới đẹp hơn */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-soft">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-3 text-lg">
                Tại sao nên đánh giá?
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>Giúp người mua khác có thêm thông tin tham khảo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>Góp phần nâng cao chất lượng dịch vụ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReviewableProductsPage;
