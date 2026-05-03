const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { formatResponse } = require('../utils/response');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return formatResponse(res, 409, false, 'Email sudah terdaftar, gunakan email lain');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      isActive: true,
    });

    // Remove password from response
    const userData = newUser.toJSON();
    delete userData.password;

    // Generate token
    const token = generateToken({ id: userData.id, role: userData.role });

    return formatResponse(res, 201, true, 'User registered successfully', {
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Error in register:', error);
    return formatResponse(res, 500, false, 'Internal server error');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return formatResponse(res, 404, false, 'Email tidak terdaftar');
    }

    // Check if user is active
    if (!user.isActive) {
      return formatResponse(res, 403, false, 'Akun kamu dinonaktifkan, hubungi admin');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return formatResponse(res, 401, false, 'Password yang kamu masukkan salah');
    }

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    // Generate token
    const token = generateToken({ id: userData.id, role: userData.role });

    return formatResponse(res, 200, true, 'Login successful', {
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Error in login:', error);
    return formatResponse(res, 500, false, 'Internal server error');
  }
};

const getMe = async (req, res) => {
  try {
    // Assuming req.user is populated by authentication middleware
    if (!req.user) {
      return formatResponse(res, 401, false, 'Unauthorized');
    }

    // Fetch user from DB to get the latest data
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return formatResponse(res, 404, false, 'User not found');
    }

    return formatResponse(res, 200, true, 'User profile retrieved successfully', {
      user,
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return formatResponse(res, 500, false, 'Internal server error');
  }
};

const logout = async (req, res) => {
  try {
    return formatResponse(res, 200, true, 'Logout successful');
  } catch (error) {
    console.error('Error in logout:', error);
    return formatResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
