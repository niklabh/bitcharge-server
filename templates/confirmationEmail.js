const mjml2html = require('mjml')

const confirmationEmail = (code, name = 'User') => {
  if (!code) {
    throw new Error('Confirmation code is required')
  }

  const template = mjml2html(`
    <mjml>
      <mj-head>
        <mj-title>Email Confirmation - Bitcharge</mj-title>
        <mj-attributes>
          <mj-all />
          <mj-text font-size="16" />

        </mj-attributes>
        <mj-font name="Montserrat" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,600,700" />
      </mj-head>
      <mj-body>
        <mj-container background-color='#f3f3f3'>

          <!-- Coinbox Header -->
          <mj-section padding-bottom='0'>
            <mj-column width='100%'>
              <mj-image src='https://res.cloudinary.com/bitcharge/image/upload/v1532990484/icons/bitcharge-logo-secondary.png' width='150' />
            </mj-column>
          </mj-section>
          <mj-spacer height="20px" />
          <mj-section background-color="#96CB6A" border-radius='2'>
              <mj-spacer height="35px" />
              <mj-column width='100%'>
                <mj-text align="center" font-size="28" font-weight='400' font-family='Montserrat' color="#FFFFFF" line-height='35px'>
                  Welcome to Bitcharge
                </mj-text>
                <mj-spacer height='35px' />
              </mj-column>
            </mj-section>
            <mj-section background-color='#fff' padding='30px 30px'>
              <mj-spacer height='30px' />
              <mj-text align='left' color='#414143' font-size='16' font-family='Montserrat'>
                Hi ${name},
              </mj-text>
              <mj-spacer height='30px' />
              <mj-text align='left' color='#414143' font-size='14' font-family='Montserrat' font-weight='300' line-height='25px'>
                 Thank you for joining Bitcharge. To start using your Bitcharge account we need to confirm your email address.
                </mj-text>
                <mj-spacer height='50px' />
                <mj-button background-color="#96CB6A" color='#fff' font-family='Montserrat' font-size='16px' inner-padding='18px 32px' href="//bitcharge.co/confirm?confirmationCode=${code}">
                  Verify Email Address
                </mj-button>
                <mj-spacer height='50px' />
                <mj-text font-size='10px' line-height='16px' font-family='Montserrat' color='rgb(165, 176, 184)' align='center'>
                  If you did not sign up for this account you can ignore this email and the account will be deleted.
                </mj-text>
            </mj-section>
          <mj-section>
            <mj-column>
              <mj-text font-size='10px' align='center' font-family='Montserrat' color='rgb(100, 100, 100)'>
                © Bitcharge 2018
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-container>
      </mj-body>
    </mjml>
  `, {})

  return template
}

if (require.main === module) {
  const template = confirmationEmail('123456')
  console.log(template)
} else {
  module.exports = confirmationEmail
}
