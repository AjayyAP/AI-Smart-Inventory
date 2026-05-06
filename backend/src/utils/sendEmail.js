const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Explicit Gmail SMTP configuration using port 587 (STARTTLS)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (uses STARTTLS)
    auth: {
      user: process.env.EMAIL_USER?.trim(), // Trim to remove accidental spaces from Render env
      pass: process.env.EMAIL_PASS?.trim(),
    },
  });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing on this server!');
    throw new Error('Email configuration is missing on the server.');
  }

  const mailOptions = {
    from: `"AI Smart Inventory" <${process.env.EMAIL_USER}>`,
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
    throw error; // Rethrow to let the controller know it failed
  }
};

module.exports = sendEmail;
