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

    // ✅ FIX: Voucher PHẦN TRĂM chỉ tính trên GIÁ GỐC SẢN PHẨM (không tính VAT)
    if (this.voucherInfo.type === 'PhanTram' || this.voucherInfo.type === 'PERCENT') {
      // Lấy giá gốc sản phẩm từ details (trước VAT)
      const previousDetails = this.calculator.getDetails();
      const basePrice = new Decimal(previousDetails.tongTienSanPham || subtotal);
      
      // Tính giảm giá trên giá gốc
      const discountRate = new Decimal(this.voucherInfo.value).dividedBy(100);
      discountAmount = basePrice.times(discountRate);

      console.log(`🎟️ Voucher ${this.voucherInfo.value}% trên giá gốc ${basePrice.toFixed(2)} = ${discountAmount.toFixed(2)}`);

      // Áp dụng giảm giá tối đa nếu có
      if (this.voucherInfo.maxDiscount) {
        const maxDiscount = new Decimal(this.voucherInfo.maxDiscount);
        if (discountAmount.greaterThan(maxDiscount)) {
          discountAmount = maxDiscount;
          console.log(`🎟️ Áp dụng giảm tối đa: ${maxDiscount.toFixed(2)}`);
        }
      }
    } else if (this.voucherInfo.type === 'TienMat' || this.voucherInfo.type === 'FIXED') {
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
      // ✅ FIX: Voucher PHẦN TRĂM tính trên GIÁ GỐC (tongTienSanPham)
      if (this.voucherInfo.type === 'PhanTram' || this.voucherInfo.type === 'PERCENT') {
        // Lấy giá gốc sản phẩm từ details (trước VAT)
        const basePrice = new Decimal(previousDetails.tongTienSanPham || subtotal);
        const discountRate = new Decimal(this.voucherInfo.value).dividedBy(100);
        discountAmount = basePrice.times(discountRate);

        if (this.voucherInfo.maxDiscount) {
          const maxDiscount = new Decimal(this.voucherInfo.maxDiscount);
          if (discountAmount.greaterThan(maxDiscount)) {
            discountAmount = maxDiscount;
            message = `Đã áp dụng giảm tối đa ${maxDiscount.toFixed(0).toLocaleString('vi-VN')}đ`;
          }
        }
      } else if (this.voucherInfo.type === 'TienMat' || this.voucherInfo.type === 'FIXED') {
        discountAmount = new Decimal(this.voucherInfo.value);
      }

      message = message || 'Đã áp dụng voucher thành công';
    }

    const totalAfterDiscount = subtotal.minus(discountAmount);
    const finalTotal = totalAfterDiscount.lessThan(0) ? new Decimal(0) : totalAfterDiscount;

    return {
      ...previousDetails,
      voucher: {
        voucherId: this.voucherInfo.voucherId, // ✅ THÊM DÒNG NÀY: Trả về ID để controller lưu vào DB
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