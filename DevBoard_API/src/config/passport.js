const passport       = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose       = require('mongoose')
const bcrypt         = require('bcryptjs')
const crypto         = require('crypto')
const logger         = require('../utils/logger')

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const User  = require('../models/User')
        const email = profile.emails?.[0]?.value
        const avatar = profile.photos?.[0]?.value || null

        // 1. Already has Google account
        let user = await User.findOne({ googleId: profile.id })
        if (user) {
          return done(null, user)
        }

        // 2. Email exists — link Google to existing account
        if (email) {
          user = await User.findOne({ email })
          if (user) {
            // Use updateOne to bypass pre-save hook completely
            await User.updateOne(
              { _id: user._id },
              {
                $set: {
                  googleId:   profile.id,
                  isVerified: true,
                  avatar:     user.avatar || avatar,
                }
              }
            )
            const updatedUser = await User.findById(user._id)
            return done(null, updatedUser)
          }
        }

        // 3. New user — insert directly into collection
        // bypasses ALL mongoose middleware including pre-save hooks
        const hashedPassword = await bcrypt.hash(
          crypto.randomBytes(32).toString('hex'),
          12
        )

        const now    = new Date()
        const result = await User.collection.insertOne({
          googleId:   profile.id,
          name:       profile.displayName || 'Google User',
          email:      email || `google_${profile.id}@noemail.com`,
          password:   hashedPassword,
          avatar,
          isVerified: true,
          role:       'user',
          createdAt:  now,
          updatedAt:  now,
          refreshTokens:       [],
          isActive:            true,
        })

        // Fetch the created user as a Mongoose document
        const newUser = await User.findById(result.insertedId)
        logger.info(`New Google user: ${newUser.email}`)
        return done(null, newUser)

      } catch (err) {
        logger.error(`Google OAuth error: ${err.message}`)
        console.error('FULL ERROR:', err)
        return done(err)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(null, false)
  }
})

module.exports = passport