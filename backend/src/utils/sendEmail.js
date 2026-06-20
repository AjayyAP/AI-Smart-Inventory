const nodemailer = require('nodemailer');
const https = require('https');

const sendWithBrevo = async (options) => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  if (!brevoApiKey) return false;

  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || process.env.EMAIL_USER?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'AI Smart Inventory';

  if (!senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL or EMAIL_USER is missing on the server.');
  }

  const payload = JSON.stringify({
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: options.email }],
    subject: options.subject,
    textContent: options.message,
    htmlContent: options.html || `<p>${options.message}</p>`,
  });

  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
      },
      timeout: 20000,
    }, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
          return;
        }

        let message = body;
        try {
          const parsed = JSON.parse(body);
          message = parsed.message || parsed.error || body;
        } catch (_) {
          // Keep raw response if Brevo returns non-JSON.
        }

        reject(new Error(`Email could not be sent: ${message || `Brevo returned ${res.statusCode}`}`));
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Email could not be sent: Brevo request timed out'));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  console.log(`Email successfully sent to ${options.email} via Brevo`);
  return true;
};

const sendEmail = async (options) => {
  const sentWithBrevo = await sendWithBrevo(options);
  if (sentWithBrevo) return;

  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  const smtpPort = Number(process.env.EMAIL_PORT) || 587;

  if (!emailUser || !emailPass) {
    console.error('CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing on this server!');
    throw new Error('Email configuration is missing on the server.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST?.trim() || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort !== 465,
    family: 4,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"AI Smart Inventory" <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.email}`);
  } catch (error) {
    console.error(`Error sending email to ${options.email}:`, error.message);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
