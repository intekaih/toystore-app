import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component - MVP
 * Hiển thị và chọn số sao (1-5)
 * 
 * @param {number} rating - Số sao hiện tại (0-5)
 * @param {number} maxStars - Số sao tối đa (default: 5)
 * @param {boolean} interactive - Có thể click để chọn không (default: false)
 * @param {function} onChange - Callback khi chọn sao (chỉ khi interactive=true)
 * @param {string} size - Kích thước: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showCount - Hiển thị số lượng đánh giá (default: false)
 * @param {number} count - Số lượng đánh giá
 */
const StarRating = ({ 
  rating = 0, 
  maxStars = 5,
  interactive = false,
  onChange = null,
  size = 'md',
  showCount = false,
  count = 0,
  className = ''
}) => {
  const [hoveredStar, setHoveredStar] = React.useState(0);

  // Xác định kích thước
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  // Xử lý click chọn sao
  const handleStarClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  // Xử lý hover
  const handleStarHover = (starValue) => {
    if (interactive) {
      setHoveredStar(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredStar(0);
    }
  };

  // Xác định trạng thái hiển thị của mỗi sao
  const getStarState = (index) => {
    const starValue = index + 1;
    const displayRating = interactive && hoveredStar > 0 ? hoveredStar : rating;

    if (displayRating >= starValue) {
      return 'full'; // Sao đầy
    } else if (displayRating >= starValue - 0.5) {
      return 'half'; // Nửa sao
    } else {
      return 'empty'; // Sao rỗng
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[...Array(maxStars)].map((_, index) => {
          const starState = getStarState(index);
          const starValue = index + 1;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              className={`
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-all duration-150
                ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded' : ''}
              `}
              aria-label={`${starValue} sao`}
            >
              {starState === 'full' && (
                <Star 
                  className={`${starSize} fill-yellow-400 text-yellow-400`}
                />
              )}
              {starState === 'half' && (
                <div className="relative">
                  <Star className={`${starSize} text-gray-300`} />
                  <Star 
                    className={`${starSize} fill-yellow-400 text-yellow-400 absolute top-0 left-0`}
                    style={{ clipPath: 'inset(0 50% 0 0)' }}
                  />
                </div>
              )}
              {starState === 'empty' && (
                <Star className={`${starSize} text-gray-300`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Hiển thị số điểm và số lượng đánh giá */}
      {showCount && (
        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold text-gray-700">
            {rating.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({count})
          </span>
        </div>
      )}

      {/* Hiển thị số sao khi đang chọn (chỉ khi interactive) */}
      {interactive && hoveredStar > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          {hoveredStar} sao
        </span>
      )}
    </div>
  );
};

export default StarRating;
