const { check } = require('express-validator/check')

const Currency = require('../models/Currency')
const Address = require('../models/Address')

const addressRegex = {
  ETH: new RegExp('^0x[a-fA-F0-9]{40}$'),
  BTC: new RegExp('^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$'),
  LTC: new RegExp('^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$'),
  BTCLN: new RegExp('(.|\n)*?')
}

const checkAddress = (address, symbol) => {
  console.log('address, symbol', address, symbol)

  const testArray = Object.keys(addressRegex).map((checkSymbol) => {
    return (symbol === checkSymbol && addressRegex[checkSymbol].test(address))
  })

  console.log('test array', testArray)

  return testArray.includes(true)
}

exports.addAddress = [
  check('address')
    .exists().withMessage('Cannot be empty')
    .custom(async (value, { req }) => {
      console.log('In address evaluation')
      try {
        const currency = await Currency.findOne({ symbol: req.body.currency })
        if (!checkAddress(value, currency.symbol)) {
          return Promise.reject(new Error('Invalid address'))
        }
        const address = await Address.findOne({ address: value })
        if (address) {
          return Promise.reject(new Error('Address already used'))
        }
      } catch (e) {
        return Promise.reject(new Error('Invalid address'))
      }
    }),

  check('currency')
    .exists().withMessage('Cannot be empty')
]

exports.updateAddress = [
  check('address')
    .exists().withMessage('Cannot be empty')
    .custom(async (value, { req }) => {
      console.log('In address evaluation')
      try {
        const currency = await Currency.findOne({ symbol: req.params.symbol })
        if (!checkAddress(value, currency.symbol)) {
          return Promise.reject(new Error('Invalid address'))
        }
        const address = await Address.findOne({ address: value })
        if (address) {
          return Promise.reject(new Error('Address already used'))
        }
      } catch (e) {
        console.log(e)
        return Promise.reject(new Error('Invalid address'))
      }
    })
]
