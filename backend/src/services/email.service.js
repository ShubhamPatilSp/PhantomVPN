const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #080B14; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #0E1420; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6C63FF, #00D4FF); padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); }
    .body { padding: 40px; }
    .body p { color: #a0aec0; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6C63FF, #00D4FF); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .footer p { color: #4a5568; font-size: 12px; margin: 0; }
    .code { background: #1a2035; border: 1px solid rgba(108,99,255,0.3); border-radius: 8px; padding: 16px 24px; font-size: 24px; font-weight: 800; letter-spacing: 4px; color: #6C63FF; text-align: center; margin: 24px 0; }
    .alert { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
    .alert p { color: #FF6B6B; margin: 0; }
  </style>
</head>
<body>
  <div style="padding: 40px 20px;">
    <div class="container">
      <div class="header">
        <h1>👻 PhantomVPN</h1>
        <p>Invisible. Unstoppable. Free.</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} PhantomVPN. All rights reserved.</p>
        <p style="margin-top:8px;">If you didn't request this email, please ignore it or <a href="#" style="color:#6C63FF;">contact support</a>.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const sendMail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"PhantomVPN" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

exports.sendVerificationEmail = async (email, name, token) => {
  const link = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = baseTemplate(`
    <h2 style="color:white; font-size:24px; margin:0 0 16px;">Verify Your Email 🔐</h2>
    <p>Hi ${name}, welcome to PhantomVPN! Click the button below to verify your email address and start protecting your privacy.</p>
    <div style="text-align:center;">
      <a href="${link}" class="btn">Verify Email Address</a>
    </div>
    <p>Or copy this link into your browser:</p>
    <p style="word-break:break-all; color:#6C63FF; font-size:14px;">${link}</p>
    <p style="font-size:14px;">This link expires in 24 hours.</p>
  `);
  await sendMail(email, 'Verify your PhantomVPN account', html);
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = baseTemplate(`
    <h2 style="color:white; font-size:24px; margin:0 0 16px;">Reset Your Password 🔑</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <div style="text-align:center;">
      <a href="${link}" class="btn">Reset Password</a>
    </div>
    <div class="alert">
      <p>⚠️ This link expires in 1 hour. If you didn't request this, ignore this email — your account is safe.</p>
    </div>
  `);
  await sendMail(email, 'Reset your PhantomVPN password', html);
};

exports.sendLoginAlertEmail = async (email, name, ip, userAgent) => {
  const html = baseTemplate(`
    <h2 style="color:white; font-size:24px; margin:0 0 16px;">New Login Detected 🚨</h2>
    <p>Hi ${name}, we detected a login to your account from a new location.</p>
    <p><strong style="color:white;">IP Address:</strong> <span style="color:#6C63FF;">${ip}</span></p>
    <p><strong style="color:white;">Device:</strong> ${userAgent?.substring(0, 80) || 'Unknown'}</p>
    <p><strong style="color:white;">Time:</strong> ${new Date().toUTCString()}</p>
    <div class="alert">
      <p>⚠️ If this wasn't you, secure your account immediately by changing your password and enabling 2FA.</p>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}/settings" class="btn">Secure My Account</a>
    </div>
  `);
  await sendMail(email, '⚠️ New login detected on your PhantomVPN account', html);
};

exports.sendWelcomeEmail = async (email, name) => {
  const html = baseTemplate(`
    <h2 style="color:white; font-size:24px; margin:0 0 16px;">Welcome to PhantomVPN! 🎉</h2>
    <p>Hi ${name}, your account is now active. Here's how to get started:</p>
    <p>1. <strong style="color:white;">Connect</strong> — Choose a server from 95+ countries</p>
    <p>2. <strong style="color:white;">Download</strong> — Install our app on all your devices</p>
    <p>3. <strong style="color:white;">Stay Private</strong> — Browse with military-grade encryption</p>
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
    </div>
  `);
  await sendMail(email, 'Welcome to PhantomVPN! 👻', html);
};
