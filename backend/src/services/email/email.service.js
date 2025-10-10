
// backend/src/services/email/email.service.js
import { sendEmail } from './email.provider.js';
import { getConfirmationEmailHTML, getPasswordResetEmailHTML } from './email.templates.js';

/**
 * Envía un correo de confirmación de registro.
 * @param {string} to - Email del destinatario.
 * @param {string} name - Nombre del usuario.
 * @param {string} confirmationToken - Token para generar el enlace de confirmación.
 */
export async function sendConfirmationEmail(to, name, confirmationToken) {
  const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${confirmationToken}`;
  const subject = 'Confirma tu cuenta en WorkCodile';
  const html = getConfirmationEmailHTML(name, confirmationLink);
  
  await sendEmail(to, subject, html);
}

/**
 * Envía un correo para restablecer la contraseña.
 * @param {string} to - Email del destinatario.
 * @param {string} name - Nombre del usuario.
 * @param {string} resetToken - Token para generar el enlace de restablecimiento.
 */
export async function sendPasswordResetEmail(to, name, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Restablece tu contraseña de WorkCodile';
  const html = getPasswordResetEmailHTML(name, resetLink);

  await sendEmail(to, subject, html);
}
