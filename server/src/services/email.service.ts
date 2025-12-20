import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.MAIL_PASS,
  },
});

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function sendContactEmail(payload: ContactPayload) {
  const { name, email, subject, message } = payload;

  if (!process.env.APP_MAIL) throw new Error("APP_MAIL not configured");

  const html = `
    Enter Message Here
  `;

  try {
    const info = await transporter.sendMail({
      // Show the actual sender while keeping authenticated mailbox; use replyTo for responses
      from: `${name} <${process.env.APP_MAIL}>`,
      replyTo: email,
      to: process.env.APP_MAIL,
      subject: `[Enter Subject] ${subject}`,
      html,
      envelope: {
        from: process.env.APP_MAIL as string,
        to: process.env.APP_MAIL as string,
      },
      headers: {
        "X-Original-Sender": email,
      },
    });
    return { success: true, id: info.messageId };
  } catch (err) {
    throw new Error(`Failed to send contact email: ${getErrorMessage(err)}`);
  }
}

export async function sendOtpEmail(toEmail: string, code: string) {
  if (!process.env.APP_MAIL) throw new Error("APP_MAIL not configured");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Your verification code</h2>
      <p>Use the following One Time Password (OTP) to complete your action.</p>
      <div style="font-size: 22px; font-weight: bold; margin: 12px 0;">${code}</div>
      <p>If you did not request this, please ignore this message.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `${process.env.APP_NAME || "App"} <${process.env.APP_MAIL}>`,
      to: toEmail,
      subject: `Your OTP Code - ${code}`,
      html,
      envelope: {
        from: process.env.APP_MAIL as string,
        to: toEmail,
      },
    });
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error('sendOtpEmail failed:', err);
    throw new Error(`Failed to send OTP email: ${getErrorMessage(err)}`);
  }
}

export type AuditPayload = {
  subject: string;
  html: string;
};

export async function sendAuditEmail(payload: AuditPayload) {
  if (!process.env.APP_MAIL) throw new Error("APP_MAIL not configured");

  try {
    const info = await transporter.sendMail({
      from: `${process.env.APP_NAME || "App"} <${process.env.APP_MAIL}>`,
      to: process.env.APP_MAIL,
      subject: payload.subject,
      html: payload.html,
      envelope: {
        from: process.env.APP_MAIL as string,
        to: process.env.APP_MAIL as string,
      },
    });
    console.log('sendAuditEmail sent:', { messageId: info.messageId, envelope: info.envelope });
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error('sendAuditEmail failed:', err);
    throw new Error(`Failed to send audit email: ${getErrorMessage(err)}`);
  }
}

export async function verifyMailer() {
  try {
    const ok = await transporter.verify();
    console.log('Mailer verified:', ok);
    return true;
  } catch (err) {
    console.error('Mailer verification failed:', err);
    throw err;
  }
}