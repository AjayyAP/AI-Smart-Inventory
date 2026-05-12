const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
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
