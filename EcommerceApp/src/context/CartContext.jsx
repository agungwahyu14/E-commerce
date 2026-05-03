import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext(null);

const SELECTION_STORAGE_KEY = '@ecommerce_cart_selection';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // Store IDs of selected items
  const { user } = useAuth();

  // Load selection state from AsyncStorage
  useEffect(() => {
    const loadSelection = async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTION_STORAGE_KEY);
        if (stored) {
          setSelectedIds(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading selection:', error);
      }
    };
    loadSelection();
  }, []);

  // Save selection state to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setSelectedIds([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartService.getCart();
      // data is { cart: [...], summary: {...} }
      if (data && data.cart) {
        setCart(data.cart);
        
        // Cleanup selectedIds for items no longer in cart
        const currentItemIds = data.cart.map(item => item.id.toString());
        setSelectedIds(prev => prev.filter(id => currentItemIds.includes(id)));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      await cartService.addToCart(product.id, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeFromCart(cartItemId);
      setSelectedIds(prev => prev.filter(id => id !== cartItemId.toString()));
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      await cartService.updateQuantity(cartItemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const toggleSelectItem = (cartItemId) => {
    const idStr = cartItemId.toString();
    setSelectedIds(prev => 
      prev.includes(idStr) 
        ? prev.filter(id => id !== idStr) 
        : [...prev, idStr]
    );
  };

  const toggleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedIds(cart.map(item => item.id.toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const clearCart = () => {
    // Note: Backend might need a clear cart endpoint if needed
    setCart([]);
    setSelectedIds([]);
  };

  // Computed values
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Only calculate totals for SELECTED items
  const selectedItems = cart.filter(item => selectedIds.includes(item.id.toString()));
  const selectedItemsCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTotalPrice = selectedItems.reduce((sum, item) => {
    const price = item.Product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const isAllSelected = cart.length > 0 && cart.length === selectedIds.length;

  // Map cart items to include 'selected' property for easy UI consumption
  const cartWithSelection = cart.map(item => ({
    ...item,
    selected: selectedIds.includes(item.id.toString())
  }));

  return (
    <CartContext.Provider 
      value={{ 
        cart: cartWithSelection, 
        isLoading, 
        totalItems,
        selectedItemsCount,
        selectedTotalPrice,
        isAllSelected,
        fetchCart,
        addToCart, 
        updateQuantity, 
        removeFromCart,
        toggleSelectItem,
        toggleSelectAll,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
