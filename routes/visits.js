const express = require('express');
const { db } = require('../db/db');
const { sendMail } = require('../db/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  const { visitorId, page } = req.body;
  if (!visitorId) return res.status(400).json({ error: 'Missing visitorId' });

  const cooldownMinutes = parseInt(process.env.VISIT_NOTIFY_COOLDOWN_MINUTES || '60', 10);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  const recent = await db.findRecentVisit(visitorId, cooldownMinutes);
  await db.addVisit({ visitor_id: visitorId, page: page || '/', ip });

  if (!recent) {
    await sendMail({
      subject: 'New visitor on navinironindustries.com',
      text: `Someone visited your website.\nPage: ${page || '/'}\nTime: ${new Date().toLocaleString('en-IN')}`,
      html: `<p>Someone visited your website.</p><p><b>Page:</b> ${page || '/'}<br><b>Time:</b> ${new Date().toLocaleString('en-IN')}</p>`
    });
  }

  res.json({ ok: true, notified: !recent });
});

module.exports = router;
