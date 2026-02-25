import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;

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