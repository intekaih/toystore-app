const Decimal = require('decimal.js');
const { OrderPriceDecorator } = require('./OrderPriceDecorator');

/**
 * ✅ CONCRETE DECORATOR - Voucher (Mã giảm giá)
 * Áp dụng mã giảm giá vào đơn hàng
 * 
 * Công thức: 
 * - Giảm theo %: TongTien = TongTienTruoc - (TongTienTruoc * GiamGia%)
 * - Giảm cố định: TongTien = TongTienTruoc - GiamGia
 */
class VoucherDecorator extends OrderPriceDecorator {
  constructor(calculator, voucherInfo = null) {
    super(calculator);
    this.voucherInfo = voucherInfo; // {code, type, value, maxDiscount, minOrderValue}
  }

  /**
   * Tính tổng tiền sau khi áp dụng voucher
   * @returns {Decimal}
   */
  calculate() {
    const subtotal = this.calculator.calculate();
    
    if (!this.voucherInfo) {
      return subtotal;
    }

    let discountAmount = new Decimal(0);

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (this.voucherInfo.minOrderValue) {
      const minOrderValue = new Decimal(this.voucherInfo.minOrderValue);
      if (subtotal.lessThan(minOrderValue)) {
        console.log(`⚠️ Đơn hàng chưa đủ giá trị tối thiểu để áp dụng voucher`);
        return subtotal;
      }
    }

    // Tính giảm giá
    if (this.voucherInfo.type === 'PERCENT') {
      // Giảm theo phần trăm
      const discountRate = new Decimal(this.voucherInfo.value).dividedBy(100);
      discountAmount = subtotal.times(discountRate);

      // Áp dụng giảm giá tối đa nếu có
      if (this.voucherInfo.maxDiscount) {
        const maxDiscount = new Decimal(this.voucherInfo.maxDiscount);
        if (discountAmount.greaterThan(maxDiscount)) {
          discountAmount = maxDiscount;
        }
      }
    } else if (this.voucherInfo.type === 'FIXED') {
      // Giảm cố định
      discountAmount = new Decimal(this.voucherInfo.value);
    }

    // Đảm bảo tổng tiền không âm
    const totalAfterDiscount = subtotal.minus(discountAmount);
    return totalAfterDiscount.lessThan(0) ? new Decimal(0) : totalAfterDiscount;
  }

  /**
   * Lấy chi tiết giá bao gồm voucher
   * @returns {Object}
   */
  getDetails() {
    const previousDetails = this.calculator.getDetails();
    const subtotal = this.calculator.calculate();
    
    if (!this.voucherInfo) {
      return {
        ...previousDetails,
        voucher: null,
        tongTien: subtotal.toFixed(2)
      };
    }

    let discountAmount = new Decimal(0);
    let isApplied = true;
    let message = '';

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (this.voucherInfo.minOrderValue) {
      const minOrderValue = new Decimal(this.voucherInfo.minOrderValue);
      if (subtotal.lessThan(minOrderValue)) {
        isApplied = false;
        message = `Đơn hàng phải từ ${minOrderValue.toFixed(0).toLocaleString('vi-VN')}đ trở lên`;
      }
    }

    if (isApplied) {
      // Tính giảm giá
      if (this.voucherInfo.type === 'PERCENT') {
        const discountRate = new Decimal(this.voucherInfo.value).dividedBy(100);
        discountAmount = subtotal.times(discountRate);

        if (this.voucherInfo.maxDiscount) {
          const maxDiscount = new Decimal(this.voucherInfo.maxDiscount);
          if (discountAmount.greaterThan(maxDiscount)) {
            discountAmount = maxDiscount;
            message = `Đã áp dụng giảm tối đa ${maxDiscount.toFixed(0).toLocaleString('vi-VN')}đ`;
          }
        }
      } else if (this.voucherInfo.type === 'FIXED') {
        discountAmount = new Decimal(this.voucherInfo.value);
      }

      message = message || 'Đã áp dụng voucher thành công';
    }

    const totalAfterDiscount = subtotal.minus(discountAmount);
    const finalTotal = totalAfterDiscount.lessThan(0) ? new Decimal(0) : totalAfterDiscount;

    return {
      ...previousDetails,
      voucher: {
        code: this.voucherInfo.code,
        type: this.voucherInfo.type,
        value: this.voucherInfo.value,
        discountAmount: discountAmount.toFixed(2),
        isApplied: isApplied,
        message: message,
        subtotalBeforeVoucher: subtotal.toFixed(2),
        totalAfterVoucher: finalTotal.toFixed(2)
      },
      tongTien: finalTotal.toFixed(2) // Cập nhật tổng tiền
    };
  }
}

module.exports = VoucherDecorator;