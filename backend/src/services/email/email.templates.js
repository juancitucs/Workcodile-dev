
// backend/src/services/email/email.templates.js

/**
 * Genera el HTML para un correo de confirmación de cuenta.
 * @param {string} name - Nombre del usuario.
 * @param {string} confirmationLink - El enlace de confirmación.
 * @returns {string} - El HTML del correo.
 */
export function getConfirmationEmailHTML(name, confirmationLink) {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>¡Bienvenido a WorkCodile, ${name}!</h2>
      <p>Gracias por registrarte. Por favor, confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
      <a href="${confirmationLink}" style="background-color: #22c55e; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Confirmar mi Correo
      </a>
      <p>Si no te registraste en WorkCodile, por favor ignora este mensaje.</p>
      <p>— El equipo de WorkCodile</p>
    </div>
  `;
}

/**
 * Genera el HTML para un correo de recuperación de contraseña.
 * @param {string} name - Nombre del usuario.
 * @param {string} resetLink - El enlace para restablecer la contraseña.
 * @returns {string} - El HTML del correo.
 */
export function getPasswordResetEmailHTML(name, resetLink) {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Recuperación de Contraseña de WorkCodile</h2>
      <p>Hola, ${name}.</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
      <a href="${resetLink}" style="background-color: #22c55e; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Restablecer Contraseña
      </a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo de forma segura.</p>
      <p>— El equipo de WorkCodile</p>
    </div>
  `;
}
