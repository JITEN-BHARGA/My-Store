import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const transporter = createTransporter();

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Click the button below to verify your email</p>
      <a href="${verifyUrl}"
         style="padding:10px 20px;background:black;color:white;text-decoration:none;">
         Verify Email
      </a>
    `,
  });
};

export const sendResetEmail = async (email: string, token: string) => {
  const transporter = createTransporter();

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
};
