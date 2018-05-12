const router = require('express').Router()

router.use('/', require('./profile'))
router.use('/', require('./auth'))

module.exports = router
