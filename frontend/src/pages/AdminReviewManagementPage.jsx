import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Search, Filter, Loader2 } from 'lucide-react';
import reviewService from '../services/reviewService';
import StarRating from '../components/StarRating';

/**
 * AdminReviewManagementPage
 * Trang quản lý đánh giá cho Admin
 */
const AdminReviewManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    trangThai: 'ChoDuyet', // Mặc định hiển thị chờ duyệt
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Load đánh giá
  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await reviewService.getAllReviews({
        page: filter.page,
        limit: filter.limit,
        trangThai: filter.trangThai
      });

      if (result.success) {
        setReviews(result.reviews);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý duyệt đánh giá
  const handleApprove = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đánh giá này?')) return;

    try {
      setProcessingId(reviewId);
      const result = await reviewService.approveReview(reviewId);
      
      if (result.success) {
        alert('✅ ' + result.message);
        loadReviews();
      }
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Xử lý từ chối đánh giá
  const handleReject = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối đánh giá này?')) return;

    try {
      setProcessingId(reviewId);
      const result = await reviewService.rejectReview(reviewId);
      
      if (result.success) {
        alert('✅ ' + result.message);
        loadReviews();
      }
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value, page: 1 });
  };

  // Stats badges
  const getStatusBadge = (trangThai) => {
    const badges = {
      'ChoDuyet': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      'DaDuyet': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      'BiTuChoi': { bg: 'bg-red-100', text: 'text-red-800', label: 'Bị từ chối' }
    };
    const badge = badges[trangThai] || badges['ChoDuyet'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quản lý đánh giá
          </h1>
          <p className="text-gray-600">
            Duyệt và quản lý đánh giá sản phẩm từ khách hàng
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('trangThai', 'ChoDuyet')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.trangThai === 'ChoDuyet'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => handleFilterChange('trangThai', 'DaDuyet')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.trangThai === 'DaDuyet'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => handleFilterChange('trangThai', 'BiTuChoi')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.trangThai === 'BiTuChoi'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bị từ chối
              </button>
              <button
                onClick={() => handleFilterChange('trangThai', null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.trangThai === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && !reviews.length ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Reviews Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Không có đánh giá nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người đánh giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đánh giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-50">
                          {/* Sản phẩm */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {review.sanPham?.hinhAnhUrl && (
                                <img
                                  src={review.sanPham.hinhAnhUrl}
                                  alt={review.sanPham.ten}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="max-w-xs">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {review.sanPham?.ten || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {review.sanPhamId}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Người đánh giá */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {review.taiKhoan?.hoTen || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {review.taiKhoan?.email}
                              </p>
                            </div>
                          </td>

                          {/* Đánh giá */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <StarRating rating={review.soSao} size="sm" />
                              {review.noiDung && (
                                <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                                  {review.noiDung}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="px-6 py-4">
                            {getStatusBadge(review.trangThai)}
                          </td>

                          {/* Ngày tạo */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(review.ngayTao).toLocaleDateString('vi-VN')}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setSelectedReview(review)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {review.trangThai === 'ChoDuyet' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(review.id)}
                                    disabled={processingId === review.id}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Duyệt"
                                  >
                                    {processingId === review.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleReject(review.id)}
                                    disabled={processingId === review.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Từ chối"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> -{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      trong <span className="font-medium">{pagination.total}</span> kết quả
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFilterChange('page', pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => handleFilterChange('page', pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Review Detail Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800">Chi tiết đánh giá</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Product */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Sản phẩm</label>
                  <p className="text-gray-900">{selectedReview.sanPham?.ten}</p>
                </div>

                {/* User */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Người đánh giá</label>
                  <p className="text-gray-900">{selectedReview.taiKhoan?.hoTen}</p>
                  <p className="text-sm text-gray-500">{selectedReview.taiKhoan?.email}</p>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Đánh giá</label>
                  <StarRating rating={selectedReview.soSao} size="lg" />
                </div>

                {/* Content */}
                {selectedReview.noiDung && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nội dung</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedReview.noiDung}</p>
                  </div>
                )}

                {/* Image */}
                {selectedReview.hinhAnh1 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hình ảnh</label>
                    <img
                      src={selectedReview.hinhAnh1}
                      alt="Review"
                      className="w-full max-w-md rounded-lg border border-gray-200 mt-2"
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedReview.trangThai)}</div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày tạo</label>
                  <p className="text-gray-900">
                    {new Date(selectedReview.ngayTao).toLocaleString('vi-VN')}
                  </p>
                </div>

                {/* Actions */}
                {selectedReview.trangThai === 'ChoDuyet' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        handleApprove(selectedReview.id);
                        setSelectedReview(null);
                      }}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Duyệt đánh giá
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReview.id);
                        setSelectedReview(null);
                      }}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewManagementPage;
