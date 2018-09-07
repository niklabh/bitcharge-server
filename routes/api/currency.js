const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const slug = require('limax')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const Currency = require('../../models/Currency')
const validate = require('../../validators/currency')
const JWT = require('../../config/jwt')

router.get('/', async (req, res, next) => {
  try {
    let currencies = await Currency.find()
    currencies = currencies.map(currency => currency.toCurrencyJSON())
    return res.status(HTTPStatus.OK).json({
      currencies
    })
  } catch (e) {
    return next(e)
  }
})

router.post('/', JWT.authenticated, validate.addCurrency, async (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req)
  if (!errors.isEmpty) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    let currencyData = matchedData(req)
    currencyData = { ...currencyData, slug: slug(currencyData.name) }
    const currency = await new Currency(currencyData).save()
    console.log(currency)

    return res.status(HTTPStatus.OK).json({
      currency: currency.toCurrencyJSON()
    })
  } catch (e) {
    return next(e)
  }
})

module.exports = router
