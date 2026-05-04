const { formatResponse } = require('../utils/response');

const COURIERS = [
  { id: 'jne', name: 'JNE', logo: '🟡' },
  { id: 'jnt', name: 'J&T Express', logo: '🔴' },
  { id: 'sicepat', name: 'SiCepat', logo: '🟢' },
  { id: 'anteraja', name: 'Anteraja', logo: '🔵' },
];

const SHIPPING_SERVICES = {
  jne: [
    { service: 'REG', name: 'Reguler', etd: '2-3 hari', pricePerKg: 9000, minPrice: 15000 },
    { service: 'YES', name: 'Yakin Esok Sampai', etd: '1 hari', pricePerKg: 18000, minPrice: 25000 },
    { service: 'OKE', name: 'Ongkos Kirim Ekonomis', etd: '4-5 hari', pricePerKg: 7000, minPrice: 10000 },
  ],
  jnt: [
    { service: 'EZ', name: 'Reguler', etd: '2-3 hari', pricePerKg: 8000, minPrice: 14000 },
    { service: 'EXPRESS', name: 'Express', etd: '1-2 hari', pricePerKg: 15000, minPrice: 22000 },
  ],
  sicepat: [
    { service: 'BEST', name: 'Besok Tiba', etd: '1 hari', pricePerKg: 16000, minPrice: 23000 },
    { service: 'GOKIL', name: 'Hemat', etd: '3-5 hari', pricePerKg: 6000, minPrice: 9000 },
    { service: 'REG', name: 'Reguler', etd: '2-3 hari', pricePerKg: 8000, minPrice: 13000 },
  ],
  anteraja: [
    { service: 'REG', name: 'Reguler', etd: '2-4 hari', pricePerKg: 7500, minPrice: 12000 },
    { service: 'NEXT', name: 'Next Day', etd: '1 hari', pricePerKg: 16000, minPrice: 24000 },
    { service: 'SAME', name: 'Same Day', etd: 'Hari ini', pricePerKg: 20000, minPrice: 30000 },
  ],
};

const calculatePrice = (pricePerKg, minPrice, weightInGram) => {
  const weightInKg = Math.ceil(weightInGram / 1000); // bulatkan ke atas
  const calculated = pricePerKg * weightInKg;
  return Math.max(calculated, minPrice); // minimal sesuai minPrice
};

const getCouriers = (req, res) => {
  return formatResponse(res, 200, true, 'Couriers retrieved', COURIERS);
};

const getServices = (req, res) => {
  const { courier, weight = 1000 } = req.query;
  const services = SHIPPING_SERVICES[courier];

  if (!services) {
    return formatResponse(res, 404, false, 'Courier not found');
  }

  const calculatedServices = services.map(s => ({
    ...s,
    finalPrice: calculatePrice(s.pricePerKg, s.minPrice, parseInt(weight))
  }));

  return formatResponse(res, 200, true, 'Services retrieved', calculatedServices);
};

const calculateShipping = (req, res) => {
  const { courierId, serviceCode, weight } = req.body;
  const services = SHIPPING_SERVICES[courierId];

  if (!services) {
    return formatResponse(res, 404, false, 'Courier not found');
  }

  const service = services.find(s => s.service === serviceCode);
  if (!service) {
    return formatResponse(res, 404, false, 'Service not found');
  }

  const finalPrice = calculatePrice(service.pricePerKg, service.minPrice, parseInt(weight));

  return formatResponse(res, 200, true, 'Shipping cost calculated', {
    ...service,
    finalPrice
  });
};

const getAllShippingOptions = (req, res) => {
  const { weight = 1000 } = req.query;
  const options = COURIERS.map(courier => {
    const services = SHIPPING_SERVICES[courier.id] || [];
    return {
      ...courier,
      services: services.map(s => ({
        ...s,
        finalPrice: calculatePrice(s.pricePerKg, s.minPrice, parseInt(weight))
      }))
    };
  });

  return formatResponse(res, 200, true, 'All shipping options retrieved', options);
};

module.exports = {
  getCouriers,
  getServices,
  calculateShipping,
  getAllShippingOptions
};
