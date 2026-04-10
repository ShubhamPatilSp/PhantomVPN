/**
 * Google OAuth 2.0 Passport Strategy.
 * Handles Google login/signup flow with account linking.
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');
const config = require('./index');

const setupGoogleOAuth = () => {
  if (!config.google.clientId || !config.google.clientSecret) {
    console.log('⚠️ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        scope: ['profile', 'email'],
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(null, false, { message: 'No email associated with this Google account.' });
          }

          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Existing Google user — log them in
            return done(null, user);
          }

          // Check if user exists with this email (link accounts)
          user = await User.findOne({ email });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isEmailVerified = true; // Google emails are pre-verified
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user from Google profile
          user = new User({
            name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || null,
            isEmailVerified: true,
            plan: 'free',
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  console.log('✅ Google OAuth strategy configured');
};

module.exports = { setupGoogleOAuth };
