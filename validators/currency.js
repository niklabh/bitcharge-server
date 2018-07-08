const { check } = require('express-validator/check')

exports.addCurrency = [
  check('name')
    .exists().withMessage('Name cannot be empty'),

  check('symbol')
    .exists().withMessage('Symbol cannot be empty'),

  check('icon')
    .exists().withMessage('Icon cannot be empty')
    .isURL().withMessage('Please provide a valid url')
]
