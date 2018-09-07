const mjml2html = require('mjml')

const forgotPasswordEmail = ({ name, code }) => {
  const firstName = name ? name.split(' ')[0] : 'There'

  if (!code) {
    throw new Error('Confirmation code is required')
  }

  const template = mjml2html(`
    <mjml>
      <mj-head>
        <mj-title>Reset Password - Bitcharge</mj-title>
        <mj-attributes>
          <mj-all></mj-all>
          <mj-text font-size="16px"></mj-text>
        </mj-attributes>
        <mj-font name="Montserrat" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,600,700"></mj-font>
      </mj-head>
      <mj-body background-color="#f3f3f3">
        <mj-raw>
          <!-- Bitcharge Header -->
        </mj-raw>
        <mj-section padding-bottom="0px">
          <mj-column width="100%">
            <mj-image src="https://res.cloudinary.com/bitcharge/image/upload/v1532990484/icons/bitcharge-logo-secondary.png" width="150px"></mj-image>
          </mj-column>
        </mj-section>
        <mj-spacer height="20px"></mj-spacer>
        <mj-section background-color="#96CB6A" border-radius="2px">
          <mj-spacer height="35px"></mj-spacer>
          <mj-column width="100%">
            <mj-text align="center" font-size="28px" font-weight="400" font-family="Montserrat, sans-serif" color="#FFFFFF" line-height="35px">Reset your Bitcharge Password</mj-text>
            <mj-spacer height="35px"></mj-spacer>
          </mj-column>
        </mj-section>
        <mj-section background-color="#fff" padding="30px 30px">
          <mj-spacer height="30px"></mj-spacer>
          <mj-text align="left" color="#414143" font-size="16px" font-family="Montserrat, sans-serif">Hi ${firstName},</mj-text>
          <mj-spacer height="30px"></mj-spacer>
          <mj-text align="left" color="#414143" font-size="14px" font-family="Montserrat, sans-serif" font-weight="300" line-height="25px">We just received a request to reset your password. Don't worry, we are here to help. Click on the link below to set your new password.</mj-text>
          <mj-spacer height="50px"></mj-spacer>
          <mj-button background-color="#96CB6A" color="#fff" font-family="Montserrat, sans-serif" font-size="16px" inner-padding="18px 32px" href="${process.env.PUBLIC_URL}/password/reset?recoveryCode=${code}">Reset Password</mj-button>
          <mj-spacer height="50px"></mj-spacer>
          <mj-text font-size="10px" line-height="16px" font-family="Montserrat, sans-serif" color="rgb(165, 176, 184)" align="center">If you didn't request this, please ignore this email. This email would expire automatically in an hour.</mj-text>
        </mj-section>
        <mj-section>
          <mj-column>
            <mj-text font-size="10px" align="center" font-family="Montserrat, sans-serif" color="rgb(100, 100, 100)">© Bitcharge 2018</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `, {})

  return template
}

if (require.main === module) {
  const template = forgotPasswordEmail({ name: 'Test Name', code: '123456' })
  console.log(template)
} else {
  module.exports = forgotPasswordEmail
}
