const router = require('express').Router()

router.use('/currencies', require('./currency'))
router.use('/addresses', require('./address'))
router.use('/', require('./profile'))
router.use('/', require('./auth'))
router.use('/password', require('./password'))

module.exports = router
