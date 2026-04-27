import nodemailer from "nodemailer";

const hasSmtpConfig = (): boolean => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );
};

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  if (!hasSmtpConfig()) {
    // Development-safe fallback so flow can be tested before SMTP is configured.
    console.log(`OTP for ${to}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Password reset OTP",
    text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
  });
};
