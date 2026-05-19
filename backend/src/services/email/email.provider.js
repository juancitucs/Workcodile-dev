const RESEND_API_KEY = process.env.RESEND_API_KEY;

const canSend = !!RESEND_API_KEY;
let resend;

if (canSend) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(RESEND_API_KEY);
    console.log('Email provider initialized (Resend).');
  } catch (err) {
    console.warn('Failed to initialize Resend:', err.message);
  }
} else {
  console.warn('Email disabled: RESEND_API_KEY not set.');
}

async function sendEmail(to, subject, html) {
  if (!canSend) {
    console.log(`[EMAIL DISABLED] Would send to ${to}: ${subject}`);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: '"WorkCodile" <noreply@codetechilo.com>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      throw new Error(`No se pudo enviar el correo: ${error.message}`);
    }
    console.log(`Email sent to ${to}. ID: ${data.id}`);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('No se pudo conectar con el servicio de correo.');
  }
}

module.exports = { sendEmail };
