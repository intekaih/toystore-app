import React, { useState, useEffect } from 'react';
import { User, Calendar, Image as ImageIcon, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui';
import reviewService from '../services/reviewService';

/**
 * ReviewStatistics Component - Thiết kế mới đẹp hơn
 */
const ReviewStatistics = ({ statistics }) => {
  if (!statistics || !statistics.totalReviews) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-3">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Chưa có đánh giá nào</p>
        <p className="text-xs text-gray-400 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này</p>
      </div>
    );
  }

  const { totalReviews, averageRating, starCounts } = statistics;

  // Render stars với gradient đẹp
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-6 h-6 text-gray-300" />
            <Star 
              className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute top-0 left-0" 
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-6 h-6 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // ✅ Hàm tính màu gradient theo số sao (Màu vàng gradient)
  const getStarGradient = (star) => {
    // Tất cả đều dùng màu vàng, độ đậm nhạt tùy vào rating
    return 'from-yellow-400 to-orange-400';
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-soft p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tổng quan - Thiết kế đẹp hơn */}
        <div className="flex flex-col items-center justify-center border-r-0 md:border-r-2 border-gray-200 py-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl mb-4 shadow-soft">
            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {averageRating.toFixed(1)}
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {renderStars(averageRating)}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {totalReviews} đánh giá
            </Badge>
          </div>
        </div>

        {/* Phân bố sao - ✅ TỶ LỆ CHÍNH XÁC VÀ MÀU VÀNG */}
        <div className="space-y-3 py-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-semibold text-gray-700">{star}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${getStarGradient(star)} rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-10 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * ReviewItem Component - Thiết kế mới sang trọng hơn
 */
const ReviewItem = ({ review }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [imageError, setImageError] = useState(false);
  const maxContentLength = 200;
  const shouldTruncate = review.noiDung && review.noiDung.length > maxContentLength;

  const displayContent = shouldTruncate && !showFullContent
    ? review.noiDung.substring(0, maxContentLength) + '...'
    : review.noiDung;

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="border-b-2 border-gray-100 last:border-0 py-6 hover:bg-gray-50 transition-colors rounded-lg px-4 -mx-4">
      {/* Header - Avatar & Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* ✅ Avatar với gradient HỒNG SỮA */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400 rounded-full flex items-center justify-center shadow-soft">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-soft border-2 border-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 text-base mb-1">
              {review.taiKhoan?.hoTen || 'Người dùng'}
            </h4>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{reviewService.formatReviewDate(review.ngayTao)}</span>
              </div>
              {review.trangThai && review.trangThai !== 'DaDuyet' && (
                <Badge variant={review.trangThai === 'ChoDuyet' ? 'warning' : 'danger'} size="sm">
                  {review.trangThai === 'ChoDuyet' ? '⏳ Chờ duyệt' : '❌ Bị từ chối'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Stars - Nổi bật hơn */}
      <div className="flex items-center gap-1 mb-3 bg-gradient-to-r from-yellow-50 to-orange-50 inline-flex px-3 py-2 rounded-full border border-yellow-200">
        {renderStars(review.soSao)}
        <span className="ml-2 text-sm font-bold text-yellow-700">
          {review.soSao}.0
        </span>
      </div>

      {/* Content - Typography đẹp hơn */}
      {review.noiDung && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-pink-600 hover:text-pink-700 text-sm font-semibold mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              {showFullContent ? (
                <>Thu gọn <ChevronLeft className="w-4 h-4" /></>
              ) : (
                <>Xem thêm <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Image - Thiết kế đẹp với overlay */}
      {review.hinhAnh1 && !imageError && (
        <div className="mt-4">
          <div className="relative inline-block rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 border-gray-200">
            <img
              src={review.hinhAnh1}
              alt="Review"
              className="w-40 h-40 object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              onClick={() => window.open(review.hinhAnh1, '_blank')}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ReviewList Component - Container chính
 */
const ReviewList = ({ sanPhamId }) => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filterStar, setFilterStar] = useState(null);

  // Load đánh giá
  const loadReviews = async (page = 1, star = null) => {
    try {
      setLoading(true);
      setError('');

      const result = await reviewService.getProductReviews(sanPhamId, {
        page,
        limit: 10,
        soSao: star
      });

      if (result.success) {
        setReviews(result.reviews);
        setStatistics(result.statistics);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sanPhamId) {
      loadReviews(1, filterStar);
    }
  }, [sanPhamId, filterStar]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    loadReviews(newPage, filterStar);
    // Scroll to reviews section
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Xử lý lọc theo sao
  const handleFilterByStar = (star) => {
    setFilterStar(star === filterStar ? null : star);
    setPagination({ ...pagination, page: 1 });
  };

  if (loading && !reviews.length) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
          <Star className="w-6 h-6 text-pink-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div id="reviews-section">
      {/* Statistics */}
      <ReviewStatistics statistics={statistics} />

      {/* ✅ Filter by star - THEME HỒNG SỮA */}
      {statistics && statistics.totalReviews > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleFilterByStar(null)}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 ${
              filterStar === null
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-400 hover:shadow-soft'
            }`}
          >
            Tất cả ({statistics.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = statistics.starCounts[star] || 0;
            if (count === 0) return null;

            return (
              <button
                key={star}
                onClick={() => handleFilterByStar(star)}
                className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 inline-flex items-center gap-1.5 ${
                  filterStar === star
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-yellow-400 hover:shadow-soft'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-4 h-4 ${filterStar === star ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                <span>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-4 mb-6 shadow-soft">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-soft overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold text-lg mb-1">
              {filterStar 
                ? `Chưa có đánh giá ${filterStar} sao`
                : 'Chưa có đánh giá nào'}
            </p>
            <p className="text-gray-400 text-sm">
              Hãy là người đầu tiên đánh giá sản phẩm này
            </p>
          </div>
        ) : (
          <div className="p-6">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* ✅ Pagination - THEME HỒNG SỮA */}
        {pagination.totalPages > 1 && (
          <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border-2 border-gray-300 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-pink-400 hover:text-pink-600 hover:shadow-soft transition-all duration-300 inline-flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-gray-600">Trang</span>
                <span className="px-3 py-1 bg-white border-2 border-pink-400 text-pink-600 font-bold rounded-full min-w-[40px] text-center">
                  {pagination.page}
                </span>
                <span className="text-sm text-gray-600">/ {pagination.totalPages}</span>
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border-2 border-gray-300 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-pink-400 hover:text-pink-600 hover:shadow-soft transition-all duration-300 inline-flex items-center gap-2"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
export { ReviewStatistics, ReviewItem };
