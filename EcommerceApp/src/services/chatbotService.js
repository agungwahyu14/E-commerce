import api from '../utils/api';

const chatbotService = {
  /**
   * Mengirim pesan ke chatbot backend
   * @param {string} message - Pesan dari user
   * @returns {Promise}
   */
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chatbot/message', { message });
      return response.data;
    } catch (error) {
      console.error('Chatbot sendMessage error:', error);
      throw error;
    }
  },
};

export default chatbotService;
