const router = require('express').Router()

router.use('/', require('./currency'))
router.use('/', require('./address'))
router.use('/', require('./profile'))
router.use('/', require('./auth'))

module.exports = router
