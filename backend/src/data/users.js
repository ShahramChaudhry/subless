import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// In-memory user store (replace with a real DB in production)
const users = [];

export function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return users.find((u) => u.id === id);
}

export function createUser({ email, password, name, provider, providerId }) {
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const id = nanoid();
  const passwordHash =
    password && password.length > 0
      ? bcrypt.hashSync(password, 10)
      : undefined;

  const user = {
    id,
    email,
    name: name || email.split("@")[0],
    passwordHash,
    provider: provider || "local",
    providerId: providerId || null
  };

  users.push(user);
  return user;
}

export function ensureOAuthUser({ email, name, provider, providerId }) {
  let user = findUserByEmail(email);
  if (!user) {
    user = createUser({ email, name, provider, providerId });
  }
  return user;
}


