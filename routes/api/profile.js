const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const cloudinary = require('cloudinary')
const cloudinaryStorage = require('multer-storage-cloudinary')
const multer = require('multer')
const randomstring = require('randomstring')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const User = require('../../models/User')
const Address = require('../../models/Address')
const JWT = require('../../config/jwt')

const validate = require('../../validators/auth')

const generateFileName = (length = 10) => {
  return randomstring.generate(length)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'avatars',
  allowedFormats: ['jpg', 'png'],
  filename: (req, file, next) => {
    return next(undefined, generateFileName(8))
  }
})

const fileParser = multer({ storage })

const getUserAddresses = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let addresses = await Address.find({ user: id })

      if (addresses.length) {
        addresses = await Promise.all(addresses.map(async (address) => {
          await address.populate('currency').execPopulate()
          return address.toAddressJSON(address.currency.toCurrencyJSON())
        }))
        return resolve(addresses)
      } else {
        return resolve([])
      }
    } catch (e) {
      return reject(e)
    }
  })
}

router.get('/profile', JWT.authenticated, async (req, res, next) => {
  try {
    const addresses = await getUserAddresses(req.user._id)
    console.log(addresses)
    return res.status(HTTPStatus.OK).json({
      ...req.user.toAuthJSON()
    })
  } catch (e) {
    return next(e)
  }
})

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

    let addresses = await getUserAddresses(user._id)
    console.log(addresses)
    return res.status(HTTPStatus.OK).json({
      ...user.toProfileJSON(),
      addresses
    })
  } catch (e) {
    return next(e)
  }
})

router.put('/profile', JWT.authenticated, fileParser.single('avatar'), validate.editProfile, async (req, res, next) => {
  console.log(req.body, req.file)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    let profileData = matchedData(req)
    if (req.file) {
      profileData['avatar'] = req.file.secure_url
      console.log('profileData', profileData)
    }
    const user = await User.findOneAndUpdate({ email: req.user.email }, profileData, { new: true })
    console.log(user)
    return res.status(HTTPStatus.OK).json({
      ...user.toProfileJSON()
    })
  } catch (e) {
    return next(e)
  }
})

module.exports = router
