const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

const User = require('../models/User')

const checkUsername = async (value) => {
  try {
    const user = await User.findOne({ username: value })
    if (user) {
      return Promise.reject(new Error('Username already in use'))
    }
  } catch (e) {
    return Promise.reject(new Error('Something went wrong'))
  }
}

exports.login = [
  check('loginField')
    .exists().withMessage('Cannot be empty'),

  check('password').exists().withMessage('Cannot be empty')
]


exports.signup = [
  check('username')
    .exists().trim().isLength({ min: 2 })
    .withMessage('Username should be atleast 2 characters long')
    .custom(checkUsername),

  check('email')
    .exists().withMessage('Email cannot be empty')
    .isEmail().withMessage('Must be a valid email')
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject(new Error('Email already in use'))
        }
      } catch (e) {
        return Promise.reject(new Error('Something went wrong'))
      }
    }),

  check('password').exists().withMessage('Password cannot be empty'),

  check('name').exists().isLength({ min: 2 })
    .withMessage('Name should be atleast 2 characters long'),

  sanitize(['username', 'email', 'name']).trim(),

  sanitize('email').normalizeEmail()
]

exports.editProfile = [
  check('username')
    .optional()
    .trim().isLength({ min: 2 })
    .withMessage('Username should be atleast 2 characters long')
    .custom(checkUsername),

  check('password')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Password cannot be empty'),

  check('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Name should be atleast 2 characters long'),

  check('intro')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Name should be atleast 2 characters long'),

  sanitize(['username', 'email', 'name']).trim()
]

exports.forgotPassword = [
  check('email')
    .exists().withMessage('Cannot be empty')
    .isEmail().withMessage('Must be a valid email')
]
