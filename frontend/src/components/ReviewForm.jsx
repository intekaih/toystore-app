import React, { useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import reviewService from '../services/reviewService';

/**
 * ReviewForm Component
 * Form để viết đánh giá sản phẩm
 */
const ReviewForm = ({ 
  sanPhamId, 
  sanPhamInfo = null,
  onSuccess = null, 
  onCancel = null 
}) => {
  const [formData, setFormData] = useState({
    soSao: 0,
    noiDung: '',
    hinhAnh1: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Xử lý chọn số sao
  const handleRatingChange = (rating) => {
    setFormData({ ...formData, soSao: rating });
    setError('');
  };

  // Xử lý nhập nội dung
  const handleContentChange = (e) => {
    setFormData({ ...formData, noiDung: e.target.value });
  };

  // Xử lý upload hình ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 10MB');
        return;
      }

      // ✅ LƯU FILE OBJECT thay vì base64
      setFormData({ ...formData, hinhAnh1: file });

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xóa hình ảnh
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, hinhAnh1: null });
  };

  // Submit đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (formData.soSao === 0) {
      setError('Vui lòng chọn số sao');
      return;
    }

    try {
      setLoading(true);
      const result = await reviewService.createReview({
        sanPhamId,
        ...formData
      });

      if (result.success) {
        // Reset form
        setFormData({ soSao: 0, noiDung: '', hinhAnh1: null });
        setImagePreview(null);
        
        // ✅ Callback với message mới
        if (onSuccess) {
          onSuccess({
            ...result.review,
            message: '✅ Đánh giá của bạn đã được gửi và hiển thị ngay lập tức!'
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Gửi đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Đánh giá sản phẩm
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thông tin sản phẩm (nếu có) */}
      {sanPhamInfo && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
          {sanPhamInfo.hinhAnh && (
            <img 
              src={sanPhamInfo.hinhAnh} 
              alt={sanPhamInfo.ten}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <h4 className="font-medium text-gray-800">{sanPhamInfo.ten}</h4>
            {sanPhamInfo.giaBan && (
              <p className="text-sm text-gray-500">
                {sanPhamInfo.giaBan.toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Chọn số sao */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={formData.soSao}
            interactive={true}
            onChange={handleRatingChange}
            size="lg"
          />
          {formData.soSao > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {formData.soSao === 5 && '🌟 Tuyệt vời!'}
              {formData.soSao === 4 && '😊 Hài lòng'}
              {formData.soSao === 3 && '😐 Bình thường'}
              {formData.soSao === 2 && '😕 Không hài lòng'}
              {formData.soSao === 1 && '😞 Rất tệ'}
            </p>
          )}
        </div>

        {/* Nội dung đánh giá */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chia sẻ trải nghiệm của bạn
          </label>
          <textarea
            value={formData.noiDung}
            onChange={handleContentChange}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Tùy chọn - Giúp người mua khác hiểu rõ hơn về sản phẩm
            </p>
            <span className="text-xs text-gray-400">
              {formData.noiDung.length}/1000
            </span>
          </div>
        </div>

        {/* Upload hình ảnh */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh (tùy chọn)
          </label>
          
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click để tải ảnh</span> hoặc kéo thả
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG tối đa 10MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || formData.soSao === 0}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
