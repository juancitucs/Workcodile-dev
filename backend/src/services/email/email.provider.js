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
    from: '"WorkCodile" <noreply@codetechilo.com>', // ESTE dominio también DEBE ser verificado en Resend
    to,
    subject,
    html,
  };

  try {
    const { data, error } = await resend.emails.send(mailOptions);

    if (error) {
      console.error('Error al enviar el correo con Resend:', error);
      throw new Error(`No se pudo enviar el correo: ${error.message}`);
    }

    console.log(`Correo enviado a: ${to}. ID del mensaje: ${data.id}`);
  } catch (error) {
    // Captura errores de red u otros problemas con la solicitud
    console.error('Error en la llamada a la API de Resend:', error);
    throw new Error('No se pudo conectar con el servicio de correo.');
  }
}

module.exports = { sendEmail };

