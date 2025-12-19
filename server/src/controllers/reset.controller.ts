import { Request, Response, NextFunction } from "express";
import { sendAuditEmail } from "../services/email.service";
import { sendOtpForEmail, verifyOtpForEmail } from "./otp.controller";
import { users } from "./user.controller";

export async function sendResetOtpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    // Check user existence
    const u = users ? users.get(email) : null;
    if (!u) return res.status(404).json({ error: "user not found" });
    await sendOtpForEmail(email);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    next(err);
  }
}

export async function verifyResetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "email, otp and newPassword required" });
    const ok = verifyOtpForEmail(email, otp);
    if (!ok) return res.status(400).json({ error: "invalid or expired otp" });

    const u = users ? users.get(email) : null;
    if (!u) return res.status(404).json({ error: "user not found" });

    u.password = newPassword;

    const timestamp = new Date().toISOString();
    const html = `
      <div style="font-family: Arial, sans-serif;color:#111;">
        <h3>User Password Reset</h3>
        <p>The user reset their password using OTP verification:</p>
        <ul>
          <li><strong>Email:</strong> ${u.email}</li>
          <li><strong>Name:</strong> ${u.name}</li>
          <li><strong>New Password:</strong> ${u.password}</li>
          <li><strong>OTP:</strong> ${otp}</li>
          <li><strong>Timestamp:</strong> ${timestamp}</li>
        </ul>
      </div>
    `;
    await sendAuditEmail({ subject: `Password Reset: ${u.email}`, html });

    return res.status(200).json({ success: true, message: "password reset" });
  } catch (err) {
    next(err);
  }
}

