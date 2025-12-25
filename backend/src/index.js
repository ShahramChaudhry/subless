import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import subscriptionsRouter from "./routes/subscriptions.js";
import authRouter from "./routes/auth.js";
import bankRouter from "./routes/bank.js";
import emailRouter from "./routes/email.js";
import privacyRouter from "./routes/privacy.js";
import { PORT, FRONTEND_URL } from "./config/env.js";
import { configurePassport } from "./auth/passport.js";

const app = express();

configurePassport();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use(
  session({
    secret: "sless-session-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "sless-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/bank", bankRouter);
app.use("/api/email", emailRouter);
app.use("/api/privacy", privacyRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


