import api from '../utils/api';

const authService = {
  /**
   * Login pengguna
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} response data dari server
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  /**
   * Register pengguna baru
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} response data dari server
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response;
  },

  /**
   * Logout pengguna (opsional: panggil endpoint backend jika ada)
   * @returns {Promise} response data dari server
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default authService;
