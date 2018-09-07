const sendgrid = require('../../config/sendgrid')

const constants = require('../../config/constants').forgotPasswordEmail
const forgotPasswordEmail = require('../../templates/forgotPasswordEmail')

const generateEmailParams = (options) => {
  const template = forgotPasswordEmail({code: options.code, name: options.to.name}).html
  return {
    from: {
      name: constants.EMAIL_FROM_NAME,
      address: constants.EMAIL_FROM
    },
    to: options.to,
    subject: constants.EMAIL_SUBJECT,
    html: template
  }
}

module.exports = (agenda) => {
  agenda.define(constants.FORGOT_PASSWORD, (job, done) => {
    const data = job.attrs.data

    let emailOptions = generateEmailParams({
      to: {
        name: data.name,
        address: data.email
      },
      code: data.code
    })

    console.log('In forgot password job', emailOptions)

    sendgrid.sendMail(emailOptions, (err, info) => {
      if (err) {
        console.log(err)
        return done(err)
      } else {
        console.log(info)
        return done(null, info)
      }
    })
  })
}
