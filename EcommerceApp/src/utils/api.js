import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG, STORAGE_KEYS } from '../constants/config';
import { logger } from './logger';

let logoutCallback = null;
let errorCallback = null;
let isLoggingOut = false;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

export const setErrorCallback = (callback) => {
  errorCallback = callback;
};

export const resetLoggingOut = () => {
  isLoggingOut = false;
};

const api = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      // Debug log token (20 chars only for security)
      const tokenDebug = token ? `${token.substring(0, 20)}...` : 'NULL';
      logger.log(`[API Debug] Token: ${tokenDebug}`);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      logger.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    } catch (error) {
      logger.error('Error fetching token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    logger.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
// Response Interceptor
api.interceptors.response.use(
  (response) => {
    logger.log(`[API Response] ${response.config.url} Status: ${response.status}`);
    logger.log(`[API Data] ${JSON.stringify(response.data, null, 2)}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      logger.error(`[API Error] ${originalRequest.url} Status: ${error.response.status}`);

      // Handle 401 Unauthorized (Token Expired)
      const isAuthEndpoint = originalRequest.url.includes('/auth/login') || 
                            originalRequest.url.includes('/auth/register') || 
                            originalRequest.url.includes('/auth/logout');
      
      const errorMessage = (error.response.data?.message || '').toLowerCase();
      const isTokenError = errorMessage.includes('expired') || 
                          errorMessage.includes('token') || 
                          errorMessage.includes('unauthorized') || 
                          errorMessage.includes('jwt') || 
                          errorMessage.includes('invalid token');

      if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint && isTokenError) {
        originalRequest._retry = true;

        if (!isLoggingOut) {
          isLoggingOut = true;
          logger.warn('Unauthorized! Session expired.');

          if (logoutCallback) {
            logoutCallback();
          }
        }
      } else {
        // Handle other backend errors (400, 500, or 401 that are NOT token related)
        if (errorCallback && !originalRequest?._skipErrorModal) {
          errorCallback(
            'Gagal',
            error.response.data?.message || 'Terjadi kesalahan pada server'
          );
        }
      }

    } else if (error.request) {
      // Tidak ada response dari server (network error)
      logger.error('[API Error] Network error', error.message);
      if (errorCallback) {
        errorCallback(
          'Koneksi Gagal',
          'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        );
      }
    } else {
      // Error konfigurasi request
      logger.error('[API Error] Setup error', error.message);
      if (errorCallback) {
        errorCallback('Error', 'Terjadi kesalahan pada aplikasi.');
      }
    }

    return Promise.reject(error);
  }                                              // ← kurung tutup async (error)
);                                               // ← kurung tutup interceptors.response.use

export default api;
