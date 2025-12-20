import dotenv from "dotenv";
import path from "path";

dotenv.config();

// If env vars aren't loaded (when running with cwd=src), try parent folder
if (!process.env.CLIENT_PORT || !process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Default allowed origins
    const defaultOrigins = [
      `http://localhost:${process.env.CLIENT_PORT || 5173}`,
      "https://email-verification-4.onrender.com/",
    ];

    // Allow additional origins via env var CLIENT_ORIGINS (comma-separated).
    // Example: CLIENT_ORIGINS="https://a.example.com,https://b.example.com"
    const extra = (process.env.CLIENT_ORIGINS || "")
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // If client sets '*' in CLIENT_ORIGINS, allow all origins.
    if (extra.includes('*')) {
      return callback(null, true);
    }

    const allowedOrigins = Array.from(new Set([...defaultOrigins, ...extra]));

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

export const backupPort = 4000;

export const jwtKey = process.env.JWT_SECRET as string;

export const generateISTTimestamp = (): string => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
