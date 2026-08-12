const express = require('express');
const { sendMail } = require('../db/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, phone, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone and message are required' });
  }

  await sendMail({
    subject: `New quote request from ${name}`,
    text: `Name: ${name}\nPhone: ${phone}\nMessage: ${message}`,
    html: `<p><b>Name:</b> ${name}</p><p><b>Phone:</b> ${phone}</p><p><b>Message:</b><br>${message}</p>`
  });

  res.json({ ok: true });
});

module.exports = router;
