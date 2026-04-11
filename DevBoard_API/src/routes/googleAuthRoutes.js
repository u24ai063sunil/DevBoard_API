const express  = require('express')
const router   = express.Router()
const passport = require('../config/passport')
const { sendTokens } = require('../utils/tokenUtils')
const { addWelcomeEmailJob } = require('../jobs/emailQueue')
const logger   = require('../utils/logger')

// GET /api/auth/google — redirect to Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
)

// Helper to wrap async route handlers and pass errors to Express
function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// GET /api/auth/google/callback — Google redirects here
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/login?error=google_failed',
  }),
  wrapAsync(async (req, res) => {
    const user = req.user;

    // Send welcome email for new users
    if (!user.welcomeEmailSent) {
      await addWelcomeEmailJob({ to: user.email, name: user.name });
      user.welcomeEmailSent = true;
      // Use updateOne to avoid triggering Mongoose middleware on raw documents
      const User = require('../models/User');
      await User.updateOne({ _id: user._id }, { $set: { welcomeEmailSent: true } });
    }

    // Generate tokens
    const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token in URL
    // Frontend will grab it and store in localStorage
    res.redirect(
      `http://localhost:5173/auth/callback?token=${accessToken}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&id=${user._id}&avatar=${encodeURIComponent(user.avatar || '')}&role=${user.role}`
    );
  })
);

module.exports = router