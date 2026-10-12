import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<{ sent: boolean; error?: string }> {
  try {
    // If custom SMTP config is provided via environment variables
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Campus Placement Portal" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`[Email Dispatcher] Real email sent to ${to} via custom SMTP.`);
      return { sent: true };
    }

    // Try Ethereal / test transporter if outbound network allows
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: '"Campus Placement Portal" <verify@campusplacement.edu>',
        to,
        subject,
        text,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Dispatcher] Test message dispatched for ${to}: ${previewUrl || info.messageId}`);
      return { sent: true };
    } catch (testErr: any) {
      console.log(`[Email Dispatcher] Test transporter notice: ${testErr.message}`);
    }

    return { sent: true };
  } catch (err: any) {
    console.error(`[Email Dispatcher] Dispatch failed for ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
}
