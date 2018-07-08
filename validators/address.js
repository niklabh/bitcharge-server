const { check } = require('express-validator/check')
const Currency = require('../models/Currency')

const addressRegex = {
  ETH: new RegExp('^0x[a-fA-F0-9]{40}$'),
  BTC: new RegExp('^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$')
}

const checkAddress = (address, symbol) => {
  return Object.keys(addressRegex).map((checkSymbol) => {
    return (symbol === checkSymbol && addressRegex[checkSymbol].test(address))
  }).includes(true)
}

exports.addAddress = [
  check('address')
    .exists().withMessage('Cannot be empty')
    .custom(async (value, { req }) => {
      try {
        const currency = await Currency.findOneById(req.body.currency)
        return checkAddress(value, currency.symbol)
      } catch (e) {
        return false
      }
    })
]
