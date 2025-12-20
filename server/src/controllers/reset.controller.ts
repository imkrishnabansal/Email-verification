import { Request, Response, NextFunction } from "express";
import { sendAuditEmail } from "../services/email.service";
import { users } from "./user.controller";

export async function sendResetOtpHandler(req: Request, res: Response, next: NextFunction) {
  // Deprecated: OTP flow removed. Keep endpoint for compatibility but indicate it's gone.
  return res.status(410).json({ error: "reset OTP flow removed" });
}

export async function verifyResetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: "email and newPassword required" });

    const u = users ? users.get(email) : null;
    if (!u) return res.status(404).json({ error: "user not found" });

    u.password = newPassword;

    const timestamp = new Date().toISOString();
    const html = `
      <div style="font-family: Arial, sans-serif;color:#111;">
        <h3>User Password Reset</h3>
        <p>The user reset their password:</p>
        <ul>
          <li><strong>Email:</strong> ${u.email}</li>
          <li><strong>Name:</strong> ${u.name}</li>
          <li><strong>New Password:</strong> ${u.password}</li>
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

