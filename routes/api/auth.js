const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const passport = require('passport')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const queue = require('../../queue/worker')
const confirmEmailConstants = require('../../config/constants').confirmationEmail
const errorTypes = require('../../config/constants').errorTypes
const JWT = require('../../config/jwt')

const User = require('../../models/User')
const validate = require('../../validators/auth')

router.post('/signup', validate.signup, async (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req).mapped()
  if (!errors.isEmpty) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors
    })
  }
  try {
    const user = await new User(matchedData(req)).save()

    const confirmationCode = user.generateConfirmationCode()
    await user.saveConfirmationCode(confirmationCode)

    queue.now(confirmEmailConstants.CONFIRM_EMAIL, {
      email: user.email,
      name: user.name,
      code: confirmationCode.code
    })

    return res.status(HTTPStatus.OK).json({
      user: user.toAuthJSON()
    })
  } catch (e) {
    console.log(e)
    return next(e)
  }
})

router.post('/login', validate.login, (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req).mapped()
  if (!errors.isEmpty) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  console.log(errors)
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err)
    if (user) {
      try {
        res.status(HTTPStatus.OK).json({
          user: user.toAuthJSON()
        })
      } catch (e) {
        return next(e)
      }
    } else {
      return next({
        statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
        errors: info
      })
    }
  })(req, res, next)
})

router.post('/confirm', JWT.authenticated, async (req, res, next) => {
  try {
    await req.user.confirmEmail(req.body.confirmationCode)
    return res.status(HTTPStatus.OK).json({
      message: 'Email confirmed successfully'
    })
  } catch (e) {
    if (e.type === errorTypes.CONFIRM_EMAIL_CODE_EXPIRED) {
      return next({
        statusCode: HTTPStatus.GONE,
        error: e
      })
    }
    return next({
      statusCode: HTTPStatus.UNAUTHORIZED,
      error: e
    })
  }
})

router.post('/forgot', validate.forgotPassword, async (req, res, next) => {
  const errors = validationResult(req).mapped()
  if (!errors.isEmpty) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors
    })
  }
})

module.exports = router
