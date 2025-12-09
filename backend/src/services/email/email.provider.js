// backend/src/services/email/email.provider.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo electrónico usando Resend.
 * @param {string} to - El destinatario del correo.
 * @param {string} subject - El asunto del correo.
 * @param {string} html - El contenido HTML del correo.
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: '"WorkCodile" <noreply@workcodile.com>', // DEBES configurar y verificar este dominio en Resend
    to,
    subject,
    html,
  };

  try {
    await resend.emails.send(mailOptions);
    console.log(`Correo enviado a: ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo con Resend:', error);
    throw new Error('No se pudo enviar el correo.');
  }
}

module.exports = { sendEmail };

