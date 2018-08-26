const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const Address = require('../../models/Address')
const Currency = require('../../models/Currency')
const JWT = require('../../config/jwt')

const validate = require('../../validators/address')

router.get('/addresses', JWT.authenticated, async (req, res, next) => {
  let addresses = await Address.find({ user: req.user._id })

  addresses = await Promise.all(addresses.map(async (address) => {
    await address.populate('currency').execPopulate()
    return address.toAddressJSON(address.currency.toCurrencyJSON())
  }))

  console.log(addresses)
  return res.status(HTTPStatus.OK).json({
    addresses
  })
})

router.get('/addresses/:symbol', JWT.authenticated, async (req, res, next) => {
  const { symbol } = req.params
  try {
    const currency = await Currency.findOne({ symbol })
    if (!currency) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'Currency not found',
        details: {
          currency: `No currency found with symbol ${symbol}`
        }
      })
    }

    const address = await Address.findOne({ currency: currency._id })
    if (!address) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'No address found',
        details: {
          address: `No address found for symbol ${symbol}`
        }
      })
    }

    await address.populate('currency').execPopulate()
    return res.status(HTTPStatus.OK).json({
      address: address.toAddressJSON(address.currency.toCurrencyJSON)
    })
  } catch (e) {
    return next(e)
  }
})

router.put('/addresses/:symbol', JWT.authenticated, validate.updateAddress, async (req, res, next) => {
  console.log(req.body)

  const errors = validationResult(req)
  if (!errors.empty()) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }

  try {
    const currency = await Currency.findOne({ symbol: req.params.symbol })
    if (!currency) {
      return next({
        statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
        errors: {
          currency: `No currency found with symbol ${req.params.symbol}`
        }
      })
    }
    let address = await Address.findOne({ user: req.user._id, currency: currency._id })

    address = await address.set({ address: req.body.address })
    return res.status(HTTPStatus.OK).json({
      address: address.toAddressJSON(currency.toCurrencyJSON())
    })
  } catch (e) {
    return next(e)
  }
})

router.post('/addresses', JWT.authenticated, validate.addAddress, async (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }

  try {
    const currency = await Currency.findOne({symbol: req.body.currency})
    const address = await new Address({
      ...matchedData(req),
      user: req.user._id,
      currency: currency._id
    }).save()
    await address.populate('currency').execPopulate()
    console.log(address)
    return res.status(HTTPStatus.OK).json({
      address: address.toAddressJSON(address.currency.toCurrencyJSON())
    })
  } catch (e) {
    return next(e)
  }
})

router.delete('/addresses/:symbol', JWT.authenticated, async (req, res, next) => {
  const { symbol } = req.params
  try {
    const currency = await Currency.findOne({ symbol })
    if (!currency) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'Currency not found',
        details: {
          currency: `No currency found with symbol ${symbol}`
        }
      })
    }
    const address = await Address.findOneAndRemove({ currency: currency._id })
    if (!address) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'No address found',
        details: {
          address: `No address found for symbol ${symbol}`
        }
      })
    }
    console.log('deleted address', address)
    return res.status(HTTPStatus.NO_CONTENT).json({
      address: `${symbol} address deleted successfully`
    })
  } catch (e) {
    return next(e)
  }
})

module.exports = router
