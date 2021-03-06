const Passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/User')

const localOptions = {
  usernameField: 'loginField'
}

const LocalLogin = new LocalStrategy(localOptions, async (email, password, done) => {
  console.log(email, password)
  try {
    const user = await User.findOne({$or: [
      { email },
      { username: email }
    ]}).exec()

    console.log(user)
    if (user && await user.verifyPassword(password)) {
      return done(null, user)
    } else {
      return done(null, false, { errors: {
        loginField: 'Credentials cannot be verified',
        'password': 'Credentials cannot be verified'
      }})
    }
  } catch (e) {
    return done(e)
  }
})

Passport.use(LocalLogin)
