import api from '../utils/api';

const shippingService = {
  getCouriers: async () => {
    const response = await api.get('/shipping/couriers');
    return response.data.data;
  },

  getServices: async (courierId, weight = 1000) => {
    const response = await api.get(`/shipping/services?courier=${courierId}&weight=${weight}`);
    return response.data.data;
  },

  calculateShipping: async ({ courierId, serviceCode, weight }) => {
    const response = await api.post('/shipping/calculate', {
      courierId,
      serviceCode,
      weight,
    });
    return response.data.data;
  },

  getAllShippingOptions: async (weight = 1000) => {
    const response = await api.get(`/shipping/all?weight=${weight}`);
    return response.data.data;
  },
};

export default shippingService;
