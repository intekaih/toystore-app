import { useState, useCallback, useMemo } from 'react';
import {
  BaseCartItem,
  VATDecorator,
  VoucherDecorator,
  FreeShippingDecorator
} from '../decorators';

/**
 * 🎣 CUSTOM HOOK - useCartDecorator
 * 
 * Hook tùy chỉnh để áp dụng Decorator Pattern cho giỏ hàng
 * 
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ hàng từ API
 * @param {Object} options - Tùy chọn decorators
 * @param {boolean} options.applyVAT - Có áp dụng VAT không (mặc định: true)
 * @param {number} options.vatRate - Tỷ lệ VAT (mặc định: 0.1)
 * @param {Object} options.voucher - Thông tin voucher
 * @param {string} options.voucher.code - Mã voucher
 * @param {number} options.voucher.discount - Số tiền giảm giá
 * @param {boolean} options.enableFreeShipping - Có kiểm tra free ship không
 * @param {number} options.shippingFee - Phí ship (mặc định: 20000)
 * @param {number} options.minOrderForFreeShip - Đơn tối thiểu free ship (mặc định: 500000)
 * 
 * @returns {Object} Thông tin giỏ hàng đã áp dụng decorators
 */
export const useCartDecorator = (cartItems = [], options = {}) => {
  const {
    applyVAT = true,
    vatRate = 0.1,
    voucher = null,
    enableFreeShipping = true,
    shippingFee = 20000,
    minOrderForFreeShip = 500000
  } = options;

  // Tính toán giỏ hàng với decorators
  const decoratedCart = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        items: [],
        subtotal: 0,
        vat: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        priceBreakdown: [],
        freeShippingInfo: null
      };
    }

    let totalSubtotal = 0;
    let totalVAT = 0;
    let totalDiscount = 0;
    let totalShipping = shippingFee;
    let allPriceBreakdown = [];

    // Xử lý từng item trong giỏ hàng
    const decoratedItems = cartItems.map(cartData => {
      // Bước 1: Tạo BaseCartItem
      let item = new BaseCartItem(cartData);
      const basePrice = item.getPrice();
      totalSubtotal += basePrice;

      // Bước 2: Áp dụng VAT nếu cần
      if (applyVAT) {
        item = new VATDecorator(item, vatRate);
        totalVAT += item.getVATAmount();
      }

      // Bước 3: Áp dụng Voucher nếu có
      if (voucher && voucher.code && voucher.discount) {
        item = new VoucherDecorator(item, voucher.discount, voucher.code);
        totalDiscount += item.getActualDiscount();
      }

      return item.getDetails();
    });

    // Tính tổng sau khi cộng VAT và trừ discount
    const subtotalWithVAT = totalSubtotal + totalVAT;
    const totalAfterDiscount = subtotalWithVAT - totalDiscount;

    // Kiểm tra free shipping cho toàn bộ đơn hàng
    let freeShippingInfo = null;
    if (enableFreeShipping) {
      const isEligible = totalAfterDiscount >= minOrderForFreeShip;
      freeShippingInfo = {
        isEligible,
        minOrderValue: minOrderForFreeShip,
        remaining: isEligible ? 0 : minOrderForFreeShip - totalAfterDiscount,
        savedAmount: isEligible ? shippingFee : 0
      };

      if (isEligible) {
        totalShipping = 0;
      }
    }

    // Tổng cuối cùng
    const finalTotal = totalAfterDiscount + totalShipping;

    // Price breakdown chi tiết
    const priceBreakdown = [
      {
        type: 'subtotal',
        label: 'Tạm tính',
        amount: totalSubtotal,
        isAddition: true
      }
    ];

    if (applyVAT && totalVAT > 0) {
      priceBreakdown.push({
        type: 'vat',
        label: `VAT (${vatRate * 100}%)`,
        amount: totalVAT,
        isAddition: true
      });
    }

    if (voucher && totalDiscount > 0) {
      priceBreakdown.push({
        type: 'discount',
        label: `Voucher ${voucher.code}`,
        amount: totalDiscount,
        isAddition: false
      });
    }

    if (totalShipping > 0) {
      priceBreakdown.push({
        type: 'shipping',
        label: 'Phí vận chuyển',
        amount: totalShipping,
        isAddition: true
      });
    } else if (enableFreeShipping && freeShippingInfo?.isEligible) {
      priceBreakdown.push({
        type: 'shipping',
        label: 'Miễn phí vận chuyển',
        amount: shippingFee,
        isAddition: false
      });
    }

    return {
      items: decoratedItems,
      subtotal: totalSubtotal,
      vat: totalVAT,
      discount: totalDiscount,
      shipping: totalShipping,
      total: finalTotal,
      priceBreakdown,
      freeShippingInfo
    };
  }, [cartItems, applyVAT, vatRate, voucher, enableFreeShipping, shippingFee, minOrderForFreeShip]);

  // Format giá VNĐ
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  return {
    ...decoratedCart,
    formatPrice
  };
};

export default useCartDecorator;
