const Mailchimp = require('mailchimp-api-v3')

const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY)

module.exports = mailchimp
