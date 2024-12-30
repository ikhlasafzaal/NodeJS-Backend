const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');  

// Local Strategy Setup
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',  // Custom username field
      passwordField: 'password',  // Custom password field
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'No user found with this email' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // Successfully authenticated
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});




module.exports = passport; 

