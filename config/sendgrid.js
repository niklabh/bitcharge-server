const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')

console.log('sendgrid api key', process.env.SENDGRID_API_KEY)
const sendgrid = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY
  })
)

module.exports = sendgrid
