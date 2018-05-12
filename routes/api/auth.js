const router = require('express').Router()
const HTTPStatus = require('http-status-codes')
const passport = require('passport')
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const User = require('../../models/User')
const validate = require('../../validators/auth')

router.post('/signup', validate.signup, async (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req)
  if (!errors.isEmpty) {
    return next({
      statusCode: HTTPStatus.UNPROCESSABLE_ENTITY,
      errors: 'cannot create'
    })
  }
  try {
    const user = await new User(matchedData(req)).save()
    console.log(user)
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

router.get('/me', async (req, res, next) => res.json({ working: true }))

module.exports = router
