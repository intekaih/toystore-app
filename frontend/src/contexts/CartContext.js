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
   * Load giỏ hàng từ API
   */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      setCart(null);
      setCartItems([]);
      setTotalItems(0);
      setTotalAmount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await cartApi.getCart();
      
      setCartItems(data.items || []);
      setTotalItems(data.totalItems || 0);
      setTotalAmount(data.totalAmount || 0);
      
      console.log('🛒 Cart loaded:', data);
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setCartItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
      await cartApi.addToCart(productId, quantity);
      
      // Reload cart để lấy data mới nhất
      await fetchCart();
      
      console.log('✅ Added to cart');
      return { success: true, message: 'Đã thêm vào giỏ hàng' };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật số lượng sản phẩm (dùng cho input số lượng)
   */
  const updateCartItem = async (sanPhamId, quantity) => {
    try {
      setLoading(true);
      await cartApi.updateCartItem(sanPhamId, quantity);
      
      // Reload cart
      await fetchCart();
      
      console.log('✅ Cart updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tăng 1 đơn vị sản phẩm
   */
  const incrementCartItem = async (productId) => {
    try {
      setLoading(true);
      await cartApi.incrementCartItem(productId);
      
      // Reload cart
      await fetchCart();
      
      console.log('✅ Incremented item');
      return { success: true };
    } catch (error) {
      console.error('❌ Error incrementing:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Giảm 1 đơn vị sản phẩm
   */
  const decrementCartItem = async (productId) => {
    try {
      setLoading(true);
      const result = await cartApi.decrementCartItem(productId);
      
      // Reload cart
      await fetchCart();
      
      if (result.removed) {
        console.log('🗑️ Item removed (quantity was 1)');
      } else {
        console.log('✅ Decremented item');
      }
      
      return { success: true, removed: result.removed };
    } catch (error) {
      console.error('❌ Error decrementing:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      await cartApi.removeFromCart(productId);
      
      // Reload cart
      await fetchCart();
      
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
      setTotalItems(0);
      setTotalAmount(0);
      
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
    incrementCartItem,
    decrementCartItem,
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
