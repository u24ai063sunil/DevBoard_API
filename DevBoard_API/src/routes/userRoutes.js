const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')
const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')

// GET /api/users/search?email=raj@test.com
router.get('/search', protect, catchAsync(async (req, res, next) => {
  const { email } = req.query

  if (!email) {
    return next(new AppError('Please provide an email to search', 400))
  }

  // Find user by email — exclude sensitive fields
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select('_id name email avatar role')

  if (!user) {
    return next(new AppError('No user found with that email', 404))
  }

  // Don't return yourself
  if (user._id.toString() === req.user.id) {
    return next(new AppError('You cannot add yourself as a member', 400))
  }

  res.status(200).json({ success: true, data: user })
}))

// GET /api/users/profile — get logged in user profile
router.get('/profile', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({ success: true, data: user })
}))

module.exports = router