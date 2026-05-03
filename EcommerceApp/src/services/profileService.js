import api from '../utils/api';

const profileService = {
  /**
   * Mengambil data profil user
   * @returns {Promise}
   */
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data.data.profile;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  /**
   * Upload foto profil (avatar)
   * @param {string} imageUri 
   * @returns {Promise}
   */
  uploadAvatar: async (imageUri) => {
    const formData = new FormData();
    
    // Extract file name and type from URI
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    });

    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Mengubah kata sandi user
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise}
   */
  changePassword: async (data) => {
    const response = await api.put('/profile/change-password', data);
    return response.data;
  }
};

export default profileService;
