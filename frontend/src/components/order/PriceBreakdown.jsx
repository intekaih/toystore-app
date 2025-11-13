import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component hiển thị breakdown giá đơn hàng
 * Sử dụng Decorator Pattern từ backend
 */
const PriceBreakdown = ({ priceBreakdown, showTitle = true, className = '' }) => {
  if (!priceBreakdown) {
    return null;
  }

  const {
    tongTienSanPham = 0,
    vat = null,
    shipping = null,
    voucher = null,
    tongTienCuoi = 0
  } = priceBreakdown;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Chi tiết giá
        </h3>
      )}

      <div className="space-y-3">
        {/* Tổng tiền sản phẩm */}
        <div className="flex justify-between items-center text-gray-700">
          <span className="text-sm">Tổng tiền sản phẩm</span>
          <span className="font-medium">{formatCurrency(tongTienSanPham)}</span>
        </div>

        {/* VAT */}
        {vat && vat.amount > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-sm flex items-center gap-2">
              Thuế VAT
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                {vat.ratePercent}
              </span>
            </span>
            <span className="font-medium text-blue-600">
              +{formatCurrency(vat.amount)}
            </span>
          </div>
        )}

        {/* Phí ship */}
        {shipping && shipping.fee > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-sm">Phí vận chuyển</span>
            <span className="font-medium text-blue-600">
              +{formatCurrency(shipping.fee)}
            </span>
          </div>
        )}

        {/* Voucher */}
        {voucher && voucher.discountAmount > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-sm flex items-center gap-2">
              Giảm giá
              {voucher.code && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded font-mono">
                  {voucher.code}
                </span>
              )}
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(voucher.discountAmount)}
            </span>
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Tổng tiền cuối */}
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-800">
            Tổng cộng
          </span>
          <span className="text-xl font-bold text-red-600">
            {formatCurrency(tongTienCuoi)}
          </span>
        </div>
      </div>

      {/* Ghi chú */}
      {(vat || shipping || voucher) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">
            Giá đã được tính toán bằng Decorator Pattern để đảm bảo chính xác
          </p>
        </div>
      )}
    </div>
  );
};

PriceBreakdown.propTypes = {
  priceBreakdown: PropTypes.shape({
    tongTienSanPham: PropTypes.number,
    vat: PropTypes.shape({
      rate: PropTypes.number,
      ratePercent: PropTypes.string,
      amount: PropTypes.number
    }),
    shipping: PropTypes.shape({
      fee: PropTypes.number
    }),
    voucher: PropTypes.shape({
      voucherId: PropTypes.number,
      code: PropTypes.string,
      discountAmount: PropTypes.number
    }),
    tongTienCuoi: PropTypes.number
  }),
  showTitle: PropTypes.bool,
  className: PropTypes.string
};

export default PriceBreakdown;