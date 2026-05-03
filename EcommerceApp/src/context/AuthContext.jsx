import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import authService from '../services/authService';
import { logger } from '../utils/logger';
import { setLogoutCallback, resetLoggingOut } from '../utils/api';

// Buat Context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Cek token dan user data di AsyncStorage saat pertama kali aplikasi dimuat
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        logger.error('Gagal mengambil data auth dari storage', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Set callback untuk interceptor API agar bisa men-trigger modal sesi berakhir
  useEffect(() => {
    setLogoutCallback(() => {
      setIsSessionExpired(true);
    });
  }, []);

  const handleSessionExpiredConfirm = async () => {
    setIsSessionExpired(false);
    resetLoggingOut();
    await logout();
  };

  const updateUserState = async (updates) => {
    try {
      const newUser = { ...user, ...updates };
      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
    } catch (error) {
      logger.error('Gagal mengupdate user state', error);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      const newToken = response.data.data.token;
      const userData = response.data.data.user;

      console.log('Debug Login - Token:', newToken);
      console.log('Debug Login - User:', userData);

      if (!newToken || !userData) {
        throw new Error('Token atau user tidak ditemukan');
      }

      setToken(newToken);
      setUser(userData);

      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      return response.data;
    } catch (error) {
      logger.error('Login gagal', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.register(name, email, password);
      
      const newToken = response.data.data.token;
      const userData = response.data.data.user;

      console.log('Debug Register - Token:', newToken);
      console.log('Debug Register - User:', userData);

      if (!newToken || !userData) {
        throw new Error('Token atau user tidak ditemukan');
      }

      setToken(newToken);
      setUser(userData);

      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      return response.data;
    } catch (error) {
      logger.error('Register gagal', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const currentToken = token; // Simpan token sementara
    
    try {
      // Panggil API logout ke backend menggunakan token yang masih ada
      if (currentToken) {
        await authService.logout().catch((err) => {
          logger.warn('Backend logout API gagal, namun proses pembersihan tetap berlanjut', err);
        });
      }
    } catch (error) {
      logger.error('Logout API crash', error);
    } finally {
      // Selalu bersihkan state dan storage di akhir
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        isSessionExpired,
        login,
        register,
        logout,
        updateUserState,
        handleSessionExpiredConfirm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
