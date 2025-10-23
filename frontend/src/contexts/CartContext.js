/**
 * Cart Context
 * Global state management for shopping cart
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as cartApi from '../api/cart.api';
import { isAuthenticated } from '../utils/storage';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  /**
   * Tính tổng số lượng và tổng tiền
   */
  const calculateTotals = useCallback((items) => {
    if (!items || items.length === 0) {
      setTotalItems(0);
      setTotalAmount(0);
      return;
    }

    const itemCount = items.reduce((sum, item) => sum + item.soLuong, 0);
    const amount = items.reduce((sum, item) => sum + (item.giaBan * item.soLuong), 0);

    setTotalItems(itemCount);
    setTotalAmount(amount);
  }, []);

  /**
   * Load giỏ hàng từ API
   */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      setCart(null);
      setCartItems([]);
      calculateTotals([]);
      return;
    }

    try {
      setLoading(true);
      const data = await cartApi.getCart();
      
      setCart(data.cart);
      setCartItems(data.items || []);
      calculateTotals(data.items || []);
      
      console.log('🛒 Cart loaded:', data);
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setCartItems([]);
      calculateTotals([]);
    } finally {
      setLoading(false);
    }
  }, [user, calculateTotals]);

  /**
   * Load giỏ hàng khi user đăng nhập
   */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const data = await cartApi.addToCart(productId, quantity);
      
      setCartItems(data.items || []);
      calculateTotals(data.items || []);
      
      console.log('✅ Added to cart:', data);
      return { success: true, message: 'Đã thêm vào giỏ hàng' };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật số lượng sản phẩm
   */
  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const data = await cartApi.updateCartItem(itemId, quantity);
      
      setCartItems(data.items || []);
      calculateTotals(data.items || []);
      
      console.log('✅ Cart updated:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const data = await cartApi.removeFromCart(itemId);
      
      setCartItems(data.items || []);
      calculateTotals(data.items || []);
      
      console.log('✅ Item removed from cart');
      return { success: true, message: 'Đã xóa khỏi giỏ hàng' };
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      
      setCartItems([]);
      calculateTotals([]);
      
      console.log('✅ Cart cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh giỏ hàng
   */
  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    cartItems,
    totalItems,
    totalAmount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
