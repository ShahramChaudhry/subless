import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { FRONTEND_URL } from "../config/env.js";
import {
  createUser,
  findUserByEmail
} from "../data/users.js";
import { signToken, authMiddleware } from "../auth/jwt.js";

const router = express.Router();

// Register (email/password)
router.post("/register", (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password are required" });
  }

  try {
    const user = createUser({ email, password, name });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Register failed" });
  }
});

// Login (email/password)
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password are required" });
  }

  const user = findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

// Get current user
router.get("/me", authMiddleware, (req, res) => {
  const user = req.user;
  res.json({ id: user.id, email: user.email, name: user.name });
});

// Google OAuth - start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth - callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const user = req.user;
    const token = signToken(user);
    const redirectUrl = `${FRONTEND_URL}/auth/google/callback?token=${encodeURIComponent(
      token
    )}`;
    res.redirect(redirectUrl);
  }
);

export default router;


