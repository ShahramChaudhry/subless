import "dotenv/config";

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3000/api/auth/google/callback";
export const GMAIL_CALLBACK_URL =
  process.env.GMAIL_CALLBACK_URL ||
  "http://localhost:3000/api/email/gmail/callback";
export const MONGO_URI = process.env.MONGO_URI || "";
export const EMAIL_TEST_MODE = process.env.EMAIL_TEST_MODE === "true" || false;

