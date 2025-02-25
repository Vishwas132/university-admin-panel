import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check if we're in test mode for emails
const isEmailTestMode = process.env.EMAIL_TEST_MODE === 'true';

/**
 * Sends a password reset email or bypasses sending in test mode
 * @returns An object indicating if the email was sent and the reset URL
 */
export const sendPasswordResetEmail = async (
  email: string, 
  resetToken: string
): Promise<{ sent: boolean; resetUrl: string }> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // If we're in test mode, bypass actual sending
  if (isEmailTestMode) {
    return { 
      sent: false, 
      resetUrl 
    };
  }

  // For production mode, send the actual email
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { sent: true, resetUrl };
};
