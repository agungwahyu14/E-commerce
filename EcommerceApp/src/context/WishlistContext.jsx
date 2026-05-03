import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { logger } from '../utils/logger';

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const initWishlist = async () => {
      if (user) {
        // Load dari cache dulu
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_WISHLIST);
          if (stored) {
            setWishlist(JSON.parse(stored) ?? []);
          }
        } catch (e) {
          logger.error('Error loading wishlist from storage', e);
        }
        // Baru fetch dari API
        fetchWishlist();
      } else {
        setWishlist([]);
      }
    };
    
    initWishlist();
  }, [user]);

  // Simpan ke storage setiap ada perubahan
  useEffect(() => {
    const saveToStorage = async () => {
      if (wishlist) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_WISHLIST, JSON.stringify(wishlist));
        } catch (e) {
          logger.error('Error saving wishlist to storage', e);
        }
      }
    };
    saveToStorage();
  }, [wishlist]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      // Pastikan extract dengan fallback response.data.data.wishlist ?? []
      // Karena getWishlist di service mengembalikan response.data.data
      const rawData = response?.wishlist ?? response ?? [];
      
      // Normalisasi: Ambil objek Product jika ada (dari association), 
      // jika tidak ada gunakan objek itu sendiri (fallback)
      const normalizedData = Array.isArray(rawData) 
        ? rawData.map(item => item.Product || item) 
        : [];
        
      setWishlist(normalizedData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (product) => {
    try {
      // Optimistic update dengan optional chaining
      const exists = wishlist?.some((item) => item.id === product.id) ?? false;
      if (exists) {
        setWishlist(wishlist?.filter((item) => item.id !== product.id) ?? []);
      } else {
        setWishlist([...(wishlist ?? []), product]);
      }

      // API call
      await wishlistService.toggleWishlist(product.id);
      
      // Refresh to ensure sync
      fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      fetchWishlist();
    }
  };

  const isInWishlist = (productId) => {
    return wishlist?.some((item) => item.id === productId) ?? false;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
