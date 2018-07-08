const router = require('express').Router()
const HTTPStatus = require('http-status-codes')

const User = require('../../models/User')
const Address = require('../../models/Address')
const JWT = require('../../config/jwt')

router.get(`/:username`, async (req, res, next) => {
  const { username } = req.params
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'User not found',
        details: {
          user: `No user found with username ${username}`
        }
      })
    }

    let addresses = await Address.find({ user: user._id })
    if (addresses.length) {
      addresses = addresses.map(async (address) => {
        await address.populate('currency').execPopulate()
        return address.toAddressJSON(address.currency.toCurrencyJSON())
      })
    }
    console.log(addresses)
    return res.status(HTTPStatus.OK).json({
      ...user.toProfileJSON(),
      addresses
    })
  } catch (e) {
    return next(e)
  }
})

router.get('/profile', JWT.authenticated, (req, res, next) => {
  return res.status(HTTPStatus.OK).json({
    user: req.user.toAuthJSON()
  })
})

/*
router.put('/profile', JWT.authenticated, (req, res, next) => {
  let form = new formidable.IncomingForm()

  form.parse(req)

  form.on('fileBegin', (name, file) => {
    file.on('error', e => next({ statusCode: HTTPStatus.UNPROCESSABLE_ENTITY, errors: e }))

    file.open = function () {
      this._writeStream
    }
  })
})
*/

module.exports = router
