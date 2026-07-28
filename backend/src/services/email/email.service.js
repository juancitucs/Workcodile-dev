const config = require('../../config/env')
const { sendEmail } = require('./email.provider')
const { getVerificationCodeHTML, getPasswordResetEmailHTML, getPasswordResetCodeEmailHTML } = require('./email.templates')

async function sendVerificationCodeEmail(to, name, verificationCode) {
  const subject = 'Tu código de verificación de WorkCodile'
  const html = getVerificationCodeHTML(name, verificationCode)
  await sendEmail(to, subject, html)
}

async function sendPasswordResetEmail(to, name, resetToken) {
  const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`
  const subject = 'Restablece tu contraseña de WorkCodile'
  const html = getPasswordResetEmailHTML(name, resetLink)
  await sendEmail(to, subject, html)
}

async function sendPasswordResetCodeEmail(to, name, resetCode) {
  const subject = 'Restablece tu contraseña de WorkCodile'
  const html = getPasswordResetCodeEmailHTML(name, resetCode)
  await sendEmail(to, subject, html)
}

module.exports = { sendVerificationCodeEmail, sendPasswordResetEmail, sendPasswordResetCodeEmail }