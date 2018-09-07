const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const queue = require('../../queue/worker')
const forgotEmailConstants = require('../../config/constants').forgotPasswordEmail
const errorTypes = require('../../config/constants').errorTypes
const validate = require('../../validators/password')

const User = require('../../models/User')

const generateRecoveryJWT = (email, code) => {
  return jwt.sign(
    { email, recoveryCode: code },
    process.env.JWT_SECRET,
    { expiresIn: '1 hour' }
  )
}

router.post('/forgot', validate.forgotPassword, async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }

  try {
    const user = await User.findOne({ email: req.body.email })

    const recoveryCode = user.generateRecoveryCode()
    await user.saveRecoveryCode(recoveryCode)

    const recoveryToken = generateRecoveryJWT(user.email, recoveryCode)

    queue.now(forgotEmailConstants.FORGOT_PASSWORD, {
      email: user.email,
      name: user.name,
      code: recoveryToken
    })

    return res.status(HTTPStatus.OK).json({
      message: 'Forgot password email sent successfully'
    })
  } catch (e) {
    console.log(e)
    return next(e)
  }
})

router.post('/reset', validate.resetPassword, async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    const decodedToken = jwt.verify(req.body.recoveryCode, process.env.JWT_SECRET)

    const user = await User.findOne({ email: decodedToken.email })

    if (!user) {
      return next({
        statusCode: HTTPStatus.NOT_FOUND,
        message: 'User not found',
        details: {
          user: `Cannot find email for confirmation`
        }
      })
    }

    await user.updatePassword(decodedToken.recoveryCode, matchedData(req).password)
    return res.status(HTTPStatus.OK).json({
      message: 'Password updated successfully'
    })
  } catch (e) {
    if (e.type === errorTypes.FORGOT_PASSWORD_CODE_EXPIRED || e.name === 'TokenExpiredError') {
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

module.exports = router
