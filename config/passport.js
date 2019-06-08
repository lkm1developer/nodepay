const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');
const Platforms = mongoose.model('Platforms');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  Users.findOne({ email })
    .then((user) => {
      if(!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));
passport.use('api-local', new LocalStrategy({
        usernameField: 'apiKey',
        passwordField: 'apiSecret' // this is the virtual field on the model
    },(apiKey, apiSecret, done) => {
        Platforms.findOne({ apiKey })
        .then((platform) => {
        if(!platform || !platform.validatePassword(apiSecret)) {
        return done(null, false, { errors: { 'apiKey or apiSecret': 'is invalid' } });
    }

    return done(null, platform);
    }).catch(done);
}));