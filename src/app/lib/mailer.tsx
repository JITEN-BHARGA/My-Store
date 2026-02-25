import nodemailer from "nodemailer";

export async function sendResetEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h3>Password Reset</h3>
      <p>Click the button below to reset your password.</p>
      <a href="${resetLink}" style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
      <p>This link will expire in 15 minutes.</p>
    `,
  });
}