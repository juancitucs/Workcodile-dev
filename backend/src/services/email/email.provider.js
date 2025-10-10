// backend/src/services/email/email.provider.js
import nodemailer from 'nodemailer';

// ------------------- ADVERTENCIA DE SEGURIDAD -------------------
// NO USES TU CONTRASEÑA PRINCIPAL DE GOOGLE.
// Debes generar una "Contraseña de aplicación" en la configuración
// de seguridad de tu cuenta de Google.
// 1. Ve a tu Cuenta de Google -> Seguridad.
// 2. Activa la Verificación en 2 pasos.
// 3. En la misma sección, busca "Contraseñas de aplicaciones".
// 4. Genera una nueva contraseña para "Correo" en "Otro dispositivo".
// 5. Usa esa contraseña de 16 caracteres en tu variable de entorno.
// ----------------------------------------------------------------

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Tu correo de Gmail
    pass: process.env.GMAIL_APP_PASSWORD, // La contraseña de aplicación generada
  },
});

/**
 * Envía un correo electrónico usando el transportador configurado.
 * @param {string} to - El destinatario del correo.
 * @param {string} subject - El asunto del correo.
 * @param {string} html - El contenido HTML del correo.
 * @returns {Promise<void>}
 */
export async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `"WorkCodile" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a: ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    // En un entorno de producción, aquí se manejaría el error de forma más robusta.
    throw new Error('No se pudo enviar el correo.');
  }
}