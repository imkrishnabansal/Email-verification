import express from "express";
import path from "path";
// import { registerHandler, loginHandler, verifyHandler } from "./controllers/user.controller";
import { sendResetOtpHandler, verifyResetHandler } from "./controllers/reset.controller";

export const router = express.Router();

// User routes (registration is disabled). Enable server-side login to capture credentials.
import { loginHandler } from "./controllers/user.controller";
router.post('/api/user/login', loginHandler);

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
