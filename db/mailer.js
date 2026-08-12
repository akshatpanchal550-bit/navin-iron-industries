const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[mailer] GMAIL_USER / GMAIL_APP_PASSWORD not set — emails will be logged to the console instead of sent.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
  return transporter;
}

async function sendMail({ subject, text, html }) {
  const to = process.env.NOTIFY_EMAIL || 'navinironindustries@gmail.com';
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] (not sent — no SMTP configured) To: ${to} | Subject: ${subject} | ${text}`);
    return;
  }
  try {
    await t.sendMail({
      from: `"Navin Iron Industries Website" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
  }
}

module.exports = { sendMail };
