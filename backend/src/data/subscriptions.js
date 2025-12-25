import { nanoid } from "nanoid";

let subscriptions = [
  {
    id: 1,
    name: "Netflix Premium",
    provider: "Netflix",
    amount: 55.0,
    nextBilling: "2024-01-15",
    status: "Active",
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    cancelledAt: null
  },
  {
    id: 2,
    name: "Spotify Premium",
    provider: "Spotify",
    amount: 25.0,
    nextBilling: "2024-01-20",
    status: "Active",
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    cancelledAt: null
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    provider: "Adobe",
    amount: 120.0,
    nextBilling: "2024-01-25",
    status: "Active",
    lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago (low usage)
    cancelledAt: null
  },
  {
    id: 4,
    name: "Etisalat Mobile",
    provider: "Etisalat",
    amount: 150.0,
    nextBilling: "2024-01-10",
    status: "Active",
    lastUsed: new Date().toISOString(), // Today
    cancelledAt: null
  },
  {
    id: 5,
    name: "Starzplay",
    provider: "Starzplay",
    amount: 35.0,
    nextBilling: "2024-01-18",
    status: "Trial",
    lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    cancelledAt: null
  }
];

let nextNumericId = 6;

export function listSubscriptions() {
  return subscriptions;
}

export function createSubscription(data) {
  const id =
    typeof data.id === "number" || typeof data.id === "string"
      ? data.id
      : nextNumericId++;

  const sub = {
    id,
    name: data.name,
    provider: data.provider,
    amount: Number(data.amount) || 0,
    nextBilling: data.nextBilling,
    status: data.status || "Active",
    lastUsed: data.lastUsed || new Date().toISOString(),
    cancelledAt: data.cancelledAt || null
  };

  subscriptions.push(sub);
  return sub;
}

export function updateSubscriptionStatus(id, status) {
  const numericId = isNaN(Number(id)) ? id : Number(id);
  const sub = subscriptions.find((s) => s.id === numericId);
  if (!sub) return null;
  sub.status = status;
  return sub;
}

export function deleteSubscription(id) {
  const numericId = isNaN(Number(id)) ? id : Number(id);
  const before = subscriptions.length;
  subscriptions = subscriptions.filter((s) => s.id !== numericId);
  return subscriptions.length < before;
}

export function ensureSubscription(data) {
  const existing = subscriptions.find(
    (s) =>
      s.name.toLowerCase() === data.name.toLowerCase() &&
      s.provider.toLowerCase() === data.provider.toLowerCase()
  );
  if (existing) {
    return existing;
  }
  return createSubscription(data);
}

export function cancelSubscription(id) {
  const numericId = isNaN(Number(id)) ? id : Number(id);
  const sub = subscriptions.find((s) => s.id === numericId);
  if (!sub) return null;
  sub.status = "Cancelled";
  sub.cancelledAt = new Date().toISOString();
  return sub;
}

export function updateLastUsed(id) {
  const numericId = isNaN(Number(id)) ? id : Number(id);
  const sub = subscriptions.find((s) => s.id === numericId);
  if (!sub) return null;
  sub.lastUsed = new Date().toISOString();
  return sub;
}

// Get subscriptions with low usage (not used in last 14 days)
export function getLowUsageSubscriptions() {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  return subscriptions.filter(
    (s) =>
      s.status === "Active" &&
      s.lastUsed &&
      new Date(s.lastUsed) < fourteenDaysAgo
  );
}

// Get subscriptions with upcoming renewals (within 7 days)
export function getUpcomingRenewals() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return subscriptions.filter(
    (s) =>
      (s.status === "Active" || s.status === "Trial") &&
      s.nextBilling &&
      new Date(s.nextBilling) <= sevenDaysFromNow &&
      new Date(s.nextBilling) >= new Date()
  );
}


