const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const logger = require('morgan')
const cors = require('cors')

require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'
const mongoURI = isProduction ? process.env.PROD_DB : process.env.LOCAL_DB

mongoose.Promise = global.Promise

connectDB()
  .on('error', console.log)
  .on('disconnected', connectDB)
  .once('open', listen)

const app = express()

// TODO: CORS settings
app.use(cors())

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

app.use(logger('dev'))

// passport
require('./config/passport')

app.use(require('./routes'))

app.use((err, req, res, next) => {
  if (isProduction) {
    return res.status(err.status || 500).json({
      errors: {
        message: err.message || 'Something went wrong',
        details: err.details || 'No details specified'
      }
    })
  }
  console.log(err)
  return res.status(err.statusCode || 500).json({
    errors: {
      message: err.message || 'Something went wrong',
      details: err
    }
  })
})

function connectDB () {
  const options = {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    useNewUrlParser: true
  }

  mongoose.connect(mongoURI, options)
  return mongoose.connection
}

function listen () {
  app.listen(process.env.PORT)
  console.log(`App is running on port ${process.env.PORT}`)
}
