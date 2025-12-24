// backend/src/services/email/email.service.js
const { sendEmail } = require('./email.provider');
const { getVerificationCodeHTML, getPasswordResetEmailHTML, getPasswordResetCodeEmailHTML } = require('./email.templates');

/**
 * Envía un correo de verificación de registro con un código.
 * @param {string} to - Email del destinatario.
 * @param {string} name - Nombre del usuario.
 * @param {string} verificationCode - Código de verificación.
 */
async function sendVerificationCodeEmail(to, name, verificationCode) {
  const subject = 'Tu código de verificación de WorkCodile';
  const html = getVerificationCodeHTML(name, verificationCode); // Use new template function
  
  await sendEmail(to, subject, html);
}

/**
 * Envía un correo para restablecer la contraseña.
 * @param {string} to - Email del destinatario.
 * @param {string} name - Nombre del usuario.
 * @param {string} resetToken - Token para generar el enlace de restablecimiento.
 */
async function sendPasswordResetEmail(to, name, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Restablece tu contraseña de WorkCodile';
  const html = getPasswordResetEmailHTML(name, resetLink);

  await sendEmail(to, subject, html);
}

/**
 * Envía un correo para restablecer la contraseña con un código.
 * @param {string} to - Email del destinatario.
 * @param {string} name - Nombre del usuario.
 * @param {string} resetCode - El código para restablecer la contraseña.
 */
async function sendPasswordResetCodeEmail(to, name, resetCode) {
  const subject = 'Restablece tu contraseña de WorkCodile';
  const html = getPasswordResetCodeEmailHTML(name, resetCode);

  await sendEmail(to, subject, html);
}

module.exports = { sendVerificationCodeEmail, sendPasswordResetEmail, sendPasswordResetCodeEmail };