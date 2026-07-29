function getVerificationCodeHTML(name, verificationCode) {
    return `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>¡Bienvenido a WorkCodile, ${name}!</h2>
      <p>Gracias por registrarte. Usa el siguiente código para verificar tu cuenta:</p>
      <p style="font-size: 24px; font-weight: bold; color: #22c55e; letter-spacing: 5px;">${verificationCode}</p>
      <p>Este código es válido por 10 minutos.</p>
      <p>Si no te registraste en WorkCodile, por favor ignora este mensaje.</p>
      <p>— El equipo de WorkCodile</p>
    </div>
  `;
}

function getPasswordResetCodeEmailHTML(name, resetCode) {
    return `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Recuperación de Contraseña de WorkCodile</h2>
      <p>Hola, ${name}.</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para restablecer tu contraseña:</p>
      <p style="font-size: 24px; font-weight: bold; color: #22c55e; letter-spacing: 5px;">${resetCode}</p>
      <p>Este código es válido por 10 minutos.</p>
      <p>Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo de forma segura.</p>
      <p>— El equipo de WorkCodile</p>
    </div>
  `;
}

module.exports = { getVerificationCodeHTML, getPasswordResetCodeEmailHTML };
