import { Request, Response, NextFunction } from "express";
import { sendOtpEmail } from "../services/email.service";

const OTP_TTL = 1000 * 60 * 5; // 5 minutes

type OtpEntry = { otp: string; expires: number };

const otpStore = new Map<string, OtpEntry>();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpForEmail(email: string) {
  const code = generateOtp();
  const expires = Date.now() + OTP_TTL;
  otpStore.set(email, { otp: code, expires });
  await sendOtpEmail(email, code);
  return { email, otp: code, expires };
}

export function verifyOtpForEmail(email: string, otp: string) {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    otpStore.delete(email);
    return false;
  }
  const ok = entry.otp === otp;
  if (ok) otpStore.delete(email);
  return ok;
}

export async function sendOtpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    await sendOtpForEmail(email);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    next(err);
  }
}

export function verifyOtpHandler(req: Request, res: Response) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "email and otp required" });
  const ok = verifyOtpForEmail(email, otp);
  return res.status(ok ? 200 : 400).json({ verified: ok });
}

