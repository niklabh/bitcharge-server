const { check } = require('express-validator/check')

const User = require('../models/User')

exports.forgotPassword = [
  check('email')
    .exists().withMessage('Cannot be empty')
    .isEmail().withMessage('Must be a valid email')
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value })
        if (!user) {
          return Promise.reject(new Error('Email does not exist'))
        }
      } catch (e) {
        return Promise.reject(new Error('Something went wrong'))
      }
    })
]

exports.resetPassword = [
  check('password').exists().withMessage('Cannot be empty')
]
