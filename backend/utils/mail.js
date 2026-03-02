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

// Send credentials (password) to newly created user
export const sendCredentialsMail = async (
  to,
  password,
  displayName = "User",
) => {
  return transporter.sendMail({
    from: `Digital Clinic <${process.env.GMAIL_EMAIL}>`,
    to,
    subject: "Welcome to Digital Clinic - Your Account Credentials",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .credentials-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .password-box { background: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #fbbf24; }
          .warning { background: #fee2e2; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ef4444; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .code { font-family: monospace; font-size: 16px; font-weight: bold; color: #1f2937; background: #e5e7eb; padding: 5px 10px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🏥 Digital Clinic</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Healthcare Management System</p>
          </div>

          <div class="content">
            <h2 style="color: #667eea; margin-top: 0;">Welcome, ${displayName}!</h2>

            <p>Your account has been successfully created on Digital Clinic. We're excited to have you on board!</p>

            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
              <p><strong>Email:</strong> <span class="code">${to}</span></p>
              <div class="password-box">
                <p style="margin: 0;"><strong>Temporary Password:</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 20px;"><span class="code">${password}</span></p>
              </div>
            </div>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
              <p style="margin: 10px 0 0 0;">This is a temporary password. For security reasons, you will be required to create a new password upon your first login.</p>
            </div>

            <h3 style="color: #374151;">Next Steps:</h3>
            <ol style="line-height: 2;">
              <li>Visit the Digital Clinic login page</li>
              <li>Enter your email and temporary password</li>
              <li>Create a strong, unique password when prompted</li>
              <li>Start using your account!</li>
            </ol>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" class="button">Login to Your Account</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Password Requirements:</strong><br>
              • At least 8 characters long<br>
              • Include uppercase and lowercase letters<br>
              • Include at least one number<br>
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;">If you didn't request this account or have any questions, please contact our support team.</p>
            <p style="margin: 0;">
              <strong>Digital Clinic</strong> | Healthcare Management System<br>
              Email: support@digitalclinic.com
            </p>
            <p style="margin: 15px 0 0 0; font-size: 11px; color: #9ca3af;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// Send payment request email to patient after appointment confirmation
export const sendPaymentRequestMail = async (
  to,
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  amount,
  appointmentId,
) => {
  const paymentLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/patient/appointments/${appointmentId}/payment`;

  return transporter.sendMail({
    from: `Digital Clinic <${process.env.GMAIL_EMAIL}>`,
    to,
    subject: "Payment Required - Appointment Confirmed",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .appointment-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 5px; }
          .payment-box { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px; border: 2px solid #f59e0b; }
          .amount { font-size: 32px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .button:hover { background: #059669; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .info-label { font-weight: bold; color: #6b7280; }
          .info-value { color: #1f2937; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Payment Required to Secure Your Slot</p>
          </div>

          <div class="content">
            <h2 style="color: #10b981; margin-top: 0;">Hello ${patientName},</h2>

            <p>Great news! Your appointment has been confirmed by the doctor. Please complete the payment to secure your appointment slot.</p>

            <div class="appointment-box">
              <h3 style="margin-top: 0; color: #374151;">Appointment Details</h3>
              <div class="info-row">
                <span class="info-label">Doctor:</span>
                <span class="info-value">${doctorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointmentDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointmentTime}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Appointment ID:</span>
                <span class="info-value">#${appointmentId}</span>
              </div>
            </div>

            <div class="payment-box">
              <h3 style="margin-top: 0; color: #92400e; text-align: center;">💳 Payment Required</h3>
              <div class="amount">Rs. ${amount}</div>
              <p style="text-align: center; margin: 10px 0; color: #92400e;">
                <strong>Please complete payment within 24 hours</strong>
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${paymentLink}" class="button">Pay Now</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Payment Methods Accepted:</strong><br>
              • Credit/Debit Card<br>
              • Online Banking<br>
              • Digital Wallets<br>
            </p>

            <div style="background: #dbeafe; padding: 15px; margin-top: 20px; border-radius: 5px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>⚠️ Important:</strong> Your appointment slot will be held for 24 hours. If payment is not received within this time, your appointment may be cancelled.
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;">Need help with payment? Contact our support team.</p>
            <p style="margin: 0;">
              <strong>Digital Clinic</strong> | Healthcare Management System<br>
              Email: support@digitalclinic.com | Phone: +1-800-CLINIC
            </p>
            <p style="margin: 15px 0 0 0; font-size: 11px; color: #9ca3af;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
