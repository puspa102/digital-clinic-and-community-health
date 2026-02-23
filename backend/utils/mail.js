import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// OTP mail function
export const otpMail = async (to, otp) => {
  return transporter.sendMail({
    from: `OTP Service <${process.env.GMAIL_EMAIL}>`,
    to,
    subject: "Your OTP Code",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
  });
};