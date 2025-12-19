import express from "express";
import path from "path";
import { sendOtpHandler, verifyOtpHandler } from "./controllers/otp.controller";
import { registerHandler, loginHandler, verifyHandler } from "./controllers/user.controller";
import { sendResetOtpHandler, verifyResetHandler } from "./controllers/reset.controller";

export const router = express.Router();

// OTP routes
router.post('/api/otp/send', sendOtpHandler);
router.post('/api/otp/verify', verifyOtpHandler);

// User routes
router.post('/api/user/register', registerHandler);
router.post('/api/user/login', loginHandler);
router.post('/api/user/verify', verifyHandler);

// Reset routes
router.post('/api/reset/send', sendResetOtpHandler);
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

router.get('/reset', (req, res) => {
  res.sendFile(path.join(clientPath, 'reset.html'));
});

router.get('/verify.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'verify.html'));
});

router.get('/reset-verify.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'reset-verify.html'));
});
