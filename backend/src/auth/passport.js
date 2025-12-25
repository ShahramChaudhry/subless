import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
} from "../config/env.js";
import { ensureOAuthUser, findUserById } from "../data/users.js";

export function configurePassport() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    // Google auth not configured; skip strategy
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails.length
              ? profile.emails[0].value
              : null;
          if (!email) {
            return done(new Error("No email from Google"), null);
          }

          const user = ensureOAuthUser({
            email,
            name: profile.displayName,
            provider: "google",
            providerId: profile.id
          });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = findUserById(id);
    done(null, user || false);
  });
}


