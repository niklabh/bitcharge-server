const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const queue = require('../../queue/worker')
const confirmEmailConstants = require('../../config/constants').confirmationEmail
const errorTypes = require('../../config/constants').errorTypes

const JWT = require('../../config/jwt')
const User = require('../../models/User')
const validate = require('../../validators/auth')

const generateConfirmationJWT = (email, code) => {
  return jwt.sign(
    { email, confirmationCode: code },
    process.env.JWT_SECRET,
    { expiresIn: '1 hour' }
  )
}

router.post('/signup', validate.signup, async (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    const user = await new User(matchedData(req)).save()

    const confirmationCode = user.generateConfirmationCode()
    await user.saveConfirmationCode(confirmationCode)

    const confirmationToken = generateConfirmationJWT(user.email, confirmationCode)

    queue.now(confirmEmailConstants.CONFIRM_EMAIL, {
      email: user.email,
      name: user.name,
      code: confirmationToken
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
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
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

router.post('/confirm', async (req, res, next) => {
  try {
    const decodedToken = jwt.decode(req.body.confirmationCode)
    const user = await User.findOne({email: decodedToken.email})

    if (!user) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'User not found',
        details: {
          user: `Cannot find email for confirmation`
        }
      })
    }

    if (user.active) {
      return res.status(HTTPStatus.OK).json({
        message: 'Email confirmed successfully'
      })
    }

    jwt.verify(req.body.confirmationCode, process.env.JWT_SECRET)

    await user.confirmEmail(decodedToken.confirmationCode)
    return res.status(HTTPStatus.OK).json({
      message: 'Email confirmed successfully'
    })
  } catch (e) {
    if (e.type === errorTypes.CONFIRM_EMAIL_CODE_EXPIRED || e.name === 'TokenExpiredError') {
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

router.get('/verify/email', JWT.authenticated, async (req, res, next) => {
  try {
    const confirmationCode = req.user.generateConfirmationCode()
    await req.user.saveConfirmationCode(confirmationCode)

    const confirmationToken = generateConfirmationJWT(req.user.email, confirmationCode)

    queue.now(confirmEmailConstants.CONFIRM_EMAIL, {
      email: req.user.email,
      name: req.user.name,
      code: confirmationToken
    })

    return res.status(HTTPStatus.OK).json({
      message: 'Verification email sent successfully'
    })
  } catch (e) {
    console.log(e)
    return next(e)
  }
})

module.exports = router
