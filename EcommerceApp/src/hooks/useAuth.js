import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook untuk mengakses global auth state.
 * Harus dipanggil di dalam komponen yang dibungkus oleh AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam komponen AuthProvider');
  }
  
  return context;
};
