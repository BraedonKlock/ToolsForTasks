/**
 * Email utility for sending password reset emails
 * Uses nodemailer - you need to install it: npm install nodemailer
 */
const nodemailer = require("nodemailer");

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send password reset email
 * @param {string} to - recipient email address
 * @param {string} resetToken - the password reset token
 * @returns {Promise}
 */
async function sendPasswordResetEmail(to, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: to,
    subject: "Password Reset - Tools for Tasks",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Password Reset Request</h2>
        <p>You requested to reset your password for your Tools for Tasks account.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: #6750A4; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 24px; font-weight: 600;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666;">This link will expire in 15 minutes.</p>
        <p style="color: #666;">If you didn't request this password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Tools for Tasks - Never forget a tool again.
        </p>
      </div>
    `,
    text: `
      Password Reset Request

      You requested to reset your password for your Tools for Tasks account.

      Click the link below to set a new password:
      ${resetLink}

      This link will expire in 15 minutes.

      If you didn't request this password reset, you can safely ignore this email.
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Verify email configuration is working
 * @returns {Promise<boolean>}
 */
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error.message);
    return false;
  }
}

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConfig,
};
