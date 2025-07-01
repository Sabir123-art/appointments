const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(
      { 
        usernameField: 'email',
        passReqToCallback: true // Allows access to req in callback
      }, 
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ email })
            .populate('student counselor')
            .select('+password'); // Explicitly select password field
          
          if (!user) {
            req.flash('error_msg', 'That email is not registered');
            return done(null, false);
          }

          // Check if account is locked
          if (user.loginAttempts >= 5 && user.lockUntil > Date.now()) {
            const retryIn = Math.ceil((user.lockUntil - Date.now()) / 60000);
            req.flash('error_msg', `Account locked. Try again in ${retryIn} minutes.`);
            return done(null, false);
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            // Reset login attempts on successful login
            await User.findByIdAndUpdate(user._id, { 
              $set: { loginAttempts: 0 },
              $unset: { lockUntil: 1 }
            });
            return done(null, user);
          } else {
            // Increment login attempts
            const updates = { $inc: { loginAttempts: 1 } };
            
            // Lock account after 5 failed attempts for 30 minutes
            if (user.loginAttempts + 1 >= 5) {
              updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
            }
            
            await User.findByIdAndUpdate(user._id, updates);
            
            req.flash('error_msg', 'Password incorrect');
            return done(null, false);
          }
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
        .populate('student counselor')
        .select('-password'); // Exclude password
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};