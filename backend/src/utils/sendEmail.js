const nodemailer = require('nodemailer');
const https = require('https');

const sendWithResend = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim() || 'AI Smart Inventory <onboarding@resend.dev>';

  if (!resendApiKey) return false;

  const payload = JSON.stringify({
    from: emailFrom,
    to: [options.email],
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  });

  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
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
          // Keep the raw response body if Resend does not return JSON.
        }

        reject(new Error(`Email could not be sent: ${message || `Resend returned ${res.statusCode}`}`));
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Email could not be sent: Resend request timed out'));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  console.log(`Email successfully sent to ${options.email} via Resend`);
  return true;
};

const sendEmail = async (options) => {
  const sentWithResend = await sendWithResend(options);
  if (sentWithResend) return;

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
