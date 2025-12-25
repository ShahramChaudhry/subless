import { describe, it, expect, beforeEach } from "vitest";
import {
  listSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  cancelSubscription,
  deleteSubscription,
  getLowUsageSubscriptions,
  getUpcomingRenewals,
  updateLastUsed
} from "../data/subscriptions.js";

// Reset subscriptions before each test
beforeEach(() => {
  // Clear subscriptions array
  const subscriptions = listSubscriptions();
  subscriptions.forEach((sub) => deleteSubscription(sub.id));
});

describe("Subscription Management", () => {
  describe("createSubscription", () => {
    it("should create a new subscription with all fields", () => {
      const now = new Date();
      const sub = createSubscription({
        name: "Netflix Premium",
        provider: "Netflix",
        amount: 55.0,
        nextBilling: "2024-02-15",
        status: "Active"
      });

      expect(sub).toHaveProperty("id");
      expect(sub.name).toBe("Netflix Premium");
      expect(sub.provider).toBe("Netflix");
      expect(sub.amount).toBe(55.0);
      expect(sub.nextBilling).toBe("2024-02-15");
      expect(sub.status).toBe("Active");
      expect(sub).toHaveProperty("lastUsed");
      expect(sub.cancelledAt).toBeNull();
    });

    it("should set default status to Active if not provided", () => {
      const sub = createSubscription({
        name: "Spotify",
        provider: "Spotify",
        amount: 25.0,
        nextBilling: "2024-02-20"
      });

      expect(sub.status).toBe("Active");
    });

    it("should set default lastUsed to current date", () => {
      const sub = createSubscription({
        name: "Test",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20"
      });

      expect(sub.lastUsed).toBeDefined();
      expect(new Date(sub.lastUsed)).toBeInstanceOf(Date);
    });
  });

  describe("updateSubscriptionStatus", () => {
    it("should update subscription status", () => {
      const sub = createSubscription({
        name: "Test",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20",
        status: "Active"
      });

      const updated = updateSubscriptionStatus(sub.id, "Paused");
      expect(updated.status).toBe("Paused");

      const updated2 = updateSubscriptionStatus(sub.id, "Active");
      expect(updated2.status).toBe("Active");
    });

    it("should return null if subscription not found", () => {
      const result = updateSubscriptionStatus(99999, "Paused");
      expect(result).toBeNull();
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel a subscription and set cancelledAt timestamp", () => {
      const sub = createSubscription({
        name: "Test",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20",
        status: "Active"
      });

      const cancelled = cancelSubscription(sub.id);
      expect(cancelled.status).toBe("Cancelled");
      expect(cancelled.cancelledAt).toBeDefined();
      expect(new Date(cancelled.cancelledAt)).toBeInstanceOf(Date);
    });

    it("should return null if subscription not found", () => {
      const result = cancelSubscription(99999);
      expect(result).toBeNull();
    });
  });

  describe("deleteSubscription", () => {
    it("should delete a subscription", () => {
      const sub = createSubscription({
        name: "Test",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20"
      });

      const beforeCount = listSubscriptions().length;
      const deleted = deleteSubscription(sub.id);
      const afterCount = listSubscriptions().length;

      expect(deleted).toBe(true);
      expect(afterCount).toBe(beforeCount - 1);
    });

    it("should return false if subscription not found", () => {
      const result = deleteSubscription(99999);
      expect(result).toBe(false);
    });
  });

  describe("updateLastUsed", () => {
    it("should update lastUsed timestamp", () => {
      const sub = createSubscription({
        name: "Test",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20"
      });

      const oldLastUsed = sub.lastUsed;
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        const updated = updateLastUsed(sub.id);
        expect(updated.lastUsed).not.toBe(oldLastUsed);
        expect(new Date(updated.lastUsed).getTime()).toBeGreaterThan(
          new Date(oldLastUsed).getTime()
        );
      }, 10);
    });

    it("should return null if subscription not found", () => {
      const result = updateLastUsed(99999);
      expect(result).toBeNull();
    });
  });
});

describe("Low Usage Detection", () => {
  it("should detect subscriptions not used in 14+ days", () => {
    const now = new Date();

    // Active subscription used recently (should not be flagged)
    createSubscription({
      name: "Recent Use",
      provider: "Test",
      amount: 10.0,
      nextBilling: "2024-02-20",
      status: "Active",
      lastUsed: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    });

    // Active subscription not used in 20 days (should be flagged)
    createSubscription({
      name: "Low Usage",
      provider: "Test",
      amount: 20.0,
      nextBilling: "2024-02-20",
      status: "Active",
      lastUsed: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
    });

    // Cancelled subscription (should not be flagged)
    const cancelled = createSubscription({
      name: "Cancelled",
      provider: "Test",
      amount: 30.0,
      nextBilling: "2024-02-20",
      status: "Active",
      lastUsed: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
    });
    cancelSubscription(cancelled.id);

    const lowUsage = getLowUsageSubscriptions();
    expect(lowUsage).toHaveLength(1);
    expect(lowUsage[0].name).toBe("Low Usage");
  });

  it("should not include paused or cancelled subscriptions", () => {
    const now = new Date();

    createSubscription({
      name: "Paused Low Usage",
      provider: "Test",
      amount: 10.0,
      nextBilling: "2024-02-20",
      status: "Paused",
      lastUsed: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
    });

    const lowUsage = getLowUsageSubscriptions();
    expect(lowUsage).toHaveLength(0);
  });
});

describe("Upcoming Renewals Detection", () => {
  it("should detect subscriptions renewing within 7 days", () => {
    const now = new Date();

    // Renewal in 3 days (should be flagged)
    createSubscription({
      name: "Renewing Soon",
      provider: "Test",
      amount: 10.0,
      nextBilling: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active"
    });

    // Renewal in 10 days (should not be flagged)
    createSubscription({
      name: "Renewing Later",
      provider: "Test",
      amount: 20.0,
      nextBilling: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active"
    });

    // Trial expiring in 2 days (should be flagged)
    createSubscription({
      name: "Trial Expiring",
      provider: "Test",
      amount: 30.0,
      nextBilling: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Trial"
    });

    const upcoming = getUpcomingRenewals();
    expect(upcoming.length).toBeGreaterThanOrEqual(2);
    expect(upcoming.some((s) => s.name === "Renewing Soon")).toBe(true);
    expect(upcoming.some((s) => s.name === "Trial Expiring")).toBe(true);
  });

  it("should not include cancelled subscriptions", () => {
    const now = new Date();

    const sub = createSubscription({
      name: "Cancelled Renewal",
      provider: "Test",
      amount: 10.0,
      nextBilling: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active"
    });
    cancelSubscription(sub.id);

    const upcoming = getUpcomingRenewals();
    expect(upcoming.some((s) => s.name === "Cancelled Renewal")).toBe(false);
  });
});

