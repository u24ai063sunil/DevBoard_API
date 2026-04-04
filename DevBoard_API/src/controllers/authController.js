const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendTokens, verifyToken, generateAccessToken } = require('../utils/tokenUtils');
const { addWelcomeEmailJob } = require('../jobs/emailQueue');
const crypto = require('crypto')
const { addPasswordResetEmailJob } = require('../jobs/emailQueue')
// POST /api/auth/register
// const register = catchAsync(async (req, res, next) => {
//   const { name, email, password } = req.body;

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new AppError('Email already in use', 409);
//   }
//   const user = await User.create({ name, email, password });
//   sendTokens(res, user, 201);
// });
const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 409));
    // throw new AppError('Email already in use', 409);
  }

  const user = await User.create({ name, email, password });

  // Add to queue — does not block the response
  await addWelcomeEmailJob({ to: email, name });

  sendTokens(res, user, 201);
});

// POST /api/auth/login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Get user WITH password (select: false means it's excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Same error message for both cases — don't reveal if email exists
    throw new AppError('Invalid email or password', 401);
  }

  sendTokens(res, user, 200);
});

// POST /api/auth/refresh
const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError('No refresh token provided', 401);
  }

  // Verify refresh token
  const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  // Issue new access token
  const accessToken = generateAccessToken(user._id, user.role);

  res.status(200).json({ success: true, accessToken });
});

// POST /api/auth/logout
const logout = catchAsync(async (req, res, next) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0), // expire immediately
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me  (protected)
const getMe = catchAsync(async (req, res, next) => {
  // req.user is attached by the protect middleware
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user });
});
// PATCH /api/auth/change-password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400))
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password')

  // Check current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401))
  }

  // Set new password — pre-save hook hashes it automatically
  user.password = newPassword
  user.passwordChangedAt = new Date()
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  })
})
// POST /api/auth/forgot-password
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  if (!email) return next(new AppError('Please provide your email', 400))

  const user = await User.findOne({ email })

  // Always return success — don't reveal if email exists
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent',
    })
  }

  // Generate token + save to DB
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // Queue email
  try {
    await addPasswordResetEmailJob({
      to:         user.email,
      name:       user.name,
      resetToken,
    })
  } catch (err) {
    // Clear token if email fails
    user.passwordResetToken   = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(new AppError('Error sending email. Try again later.', 500))
  }

  res.status(200).json({
    success: true,
    message: 'If that email exists, a reset link has been sent',
  })
})

// POST /api/auth/reset-password
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return next(new AppError('Token and new password are required', 400))
  }

  // Hash the token from URL to compare with DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  // Find user with valid non-expired token
  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // not expired
  })

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400))
  }

  // Set new password — pre-save hook hashes it
  user.password             = newPassword
  user.passwordResetToken   = undefined
  user.passwordResetExpires = undefined
  user.passwordChangedAt    = new Date()
  await user.save()

  // Log them in immediately with new token
  sendTokens(res, user, 200)
})
// Add to exports
module.exports = {
  register, login, refreshToken, logout,
  getMe, changePassword, forgotPassword, resetPassword,
}