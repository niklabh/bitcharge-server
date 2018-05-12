const router = require('express').Router()
const HTTPStatus = require('http-status-codes')

const User = require('../../models/User')
const Address = require('../../models/Address')

router.get(`/:username`, async (req, res, next) => {
  const { username } = req.params
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'User not found',
        details: {
          project: `No user found with username ${username}`
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

module.exports = router
