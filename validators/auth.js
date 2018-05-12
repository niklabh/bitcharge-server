const { check } = require('express-validator/check')
const User = require('../models/User')
const { sanitize } = require('express-validator/filter')

exports.login = [
  check('loginField')
    .exists().withMessage('Cannot be empty'),

  check('password').exists().withMessage('Cannot be empty')
]

exports.resetPassword = [
  check('email')
    .exists().withMessage('Cannot be empty')
    .isEmail().withMessage('Must be a valid email')
]

exports.signup = [
  check('username')
    .exists().trim().isLength({ min: 2 })
    .withMessage('Username should be atleast 2 characters long'),

  check('email')
    .exists().withMessage('Email cannot be empty')
    .isEmail().withMessage('Must be a valid email'),

  check('password').exists().withMessage('Password cannot be empty'),

  check('name').exists().isLength({ min: 2 })
    .withMessage('Name should be atleast 2 characters long'),

  sanitize(['username', 'email', 'name']).trim(),

  sanitize('email').normalizeEmail()
]
