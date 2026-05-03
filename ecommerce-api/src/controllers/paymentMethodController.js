const PaymentMethod = require('../models/PaymentMethod');
const { formatResponse } = require('../utils/response');

const getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const methods = await PaymentMethod.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    return formatResponse(res, 200, true, 'Payment methods retrieved successfully', { methods });
  } catch (error) {
    next(error);
  }
};

const addPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, provider, accountNumber, accountName, isDefault } = req.body;

    if (isDefault) {
      // Set all other methods of this user to not default
      await PaymentMethod.update({ isDefault: false }, { where: { userId } });
    }

    const newMethod = await PaymentMethod.create({
      userId,
      type,
      provider,
      accountNumber,
      accountName,
      isDefault: isDefault || false
    });

    return formatResponse(res, 201, true, 'Payment method added successfully', { method: newMethod });
  } catch (error) {
    next(error);
  }
};

const deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const method = await PaymentMethod.findOne({ where: { id, userId } });
    if (!method) {
      return formatResponse(res, 404, false, 'Payment method not found');
    }

    await method.destroy();
    return formatResponse(res, 200, true, 'Payment method deleted successfully');
  } catch (error) {
    next(error);
  }
};

const setDefault = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const method = await PaymentMethod.findOne({ where: { id, userId } });
    if (!method) {
      return formatResponse(res, 404, false, 'Payment method not found');
    }

    // Set all other methods to not default
    await PaymentMethod.update({ isDefault: false }, { where: { userId } });

    // Set this one as default
    method.isDefault = true;
    await method.save();

    return formatResponse(res, 200, true, 'Payment method set as default', { method });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefault
};
