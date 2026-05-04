const User = require('../models/User');
const { formatResponse } = require('../utils/response');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Do not send password back
    });

    if (!user) {
      return formatResponse(res, 404, false, 'User not found');
    }

    return formatResponse(res, 200, true, 'Profile retrieved successfully', {
      profile: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      name, phone, address, bio, 
      latitude, longitude, city, province, postalCode 
    } = req.body;

    if (name && name.length < 2) {
      return formatResponse(res, 400, false, 'Nama minimal 2 karakter');
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return formatResponse(res, 404, false, 'User not found');
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;
    if (city !== undefined) user.city = city;
    if (province !== undefined) user.province = province;
    if (postalCode !== undefined) user.postalCode = postalCode;

    await user.save();

    // Prepare response without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return formatResponse(res, 200, true, 'Profile updated successfully', {
      profile: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return formatResponse(res, 400, false, 'File tidak ditemukan');
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return formatResponse(res, 404, false, 'User not found');
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const outputFileName = `processed-${fileName}`;
    const outputPath = path.join('public/uploads/avatars', outputFileName);

    // Resize and optimize image
    await sharp(filePath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Remove the original uploaded file (before processing)
    fs.unlinkSync(filePath);

    // Delete old avatar if exists
    if (user.avatar_url) {
      const oldAvatarFileName = user.avatar_url.split('/').pop();
      const oldAvatarPath = path.join('public/uploads/avatars', oldAvatarFileName);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user record
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${outputFileName}`;
    user.avatar_url = fullUrl;
    await user.save();

    return formatResponse(res, 200, true, 'Avatar uploaded successfully', {
      avatar_url: fullUrl
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return formatResponse(res, 400, false, 'Semua field harus diisi');
    }

    if (newPassword !== confirmPassword) {
      return formatResponse(res, 400, false, 'Konfirmasi kata sandi tidak cocok');
    }

    // New Password Strength Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return formatResponse(res, 400, false, 'Kata sandi minimal 8 karakter, mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka');
    }

    // Fetch user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return formatResponse(res, 404, false, 'User tidak ditemukan');
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return formatResponse(res, 401, false, 'Kata sandi saat ini tidak benar');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return formatResponse(res, 200, true, 'Kata sandi berhasil diubah');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword
};
