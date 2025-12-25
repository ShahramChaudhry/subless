import { describe, it, expect, beforeEach } from "vitest";
import {
  createSubscription,
  cancelSubscription,
  getLowUsageSubscriptions,
  getUpcomingRenewals
} from "../data/subscriptions.js";
import { deleteSubscription } from "../data/subscriptions.js";
import { listSubscriptions } from "../data/subscriptions.js";

beforeEach(() => {
  const subscriptions = listSubscriptions();
  subscriptions.forEach((sub) => deleteSubscription(sub.id));
});

describe("Alerts System", () => {
  describe("Low Usage Alerts", () => {
    it("should correctly calculate days since last use", () => {
      const now = new Date();
      const daysAgo = 20;
      
      const sub = createSubscription({
        name: "Test",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20",
        status: "Active",
        lastUsed: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      });

      const lowUsage = getLowUsageSubscriptions();
      expect(lowUsage).toContainEqual(
        expect.objectContaining({ id: sub.id })
      );
    });

    it("should include multiple low usage subscriptions", () => {
      const now = new Date();

      createSubscription({
        name: "Low Usage 1",
        provider: "Test",
        amount: 10.0,
        nextBilling: "2024-02-20",
        status: "Active",
        lastUsed: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
      });

      createSubscription({
        name: "Low Usage 2",
        provider: "Test",
        amount: 20.0,
        nextBilling: "2024-02-20",
        status: "Active",
        lastUsed: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString()
      });

      createSubscription({
        name: "Low Usage 3",
        provider: "Test",
        amount: 30.0,
        nextBilling: "2024-02-20",
        status: "Active",
        lastUsed: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
      });

      const lowUsage = getLowUsageSubscriptions();
      expect(lowUsage.length).toBe(3);
    });
  });

  describe("Upcoming Renewal Alerts", () => {
    it("should detect renewals within 7 days", () => {
      const now = new Date();

      // Renewal in 1 day
      createSubscription({
        name: "Renewal 1 Day",
        provider: "Test",
        amount: 10.0,
        nextBilling: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Active"
      });

      // Renewal in 7 days (boundary case)
      createSubscription({
        name: "Renewal 7 Days",
        provider: "Test",
        amount: 20.0,
        nextBilling: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Active"
      });

      // Renewal in 8 days (should not be included)
      createSubscription({
        name: "Renewal 8 Days",
        provider: "Test",
        amount: 30.0,
        nextBilling: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Active"
      });

      const upcoming = getUpcomingRenewals();
      expect(upcoming.length).toBe(2);
      expect(upcoming.some((s) => s.name === "Renewal 1 Day")).toBe(true);
      expect(upcoming.some((s) => s.name === "Renewal 7 Days")).toBe(true);
      expect(upcoming.some((s) => s.name === "Renewal 8 Days")).toBe(false);
    });

    it("should include trial subscriptions", () => {
      const now = new Date();

      createSubscription({
        name: "Trial Subscription",
        provider: "Test",
        amount: 15.0,
        nextBilling: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Trial"
      });

      const upcoming = getUpcomingRenewals();
      expect(upcoming.some((s) => s.name === "Trial Subscription")).toBe(true);
      expect(upcoming.find((s) => s.name === "Trial Subscription")?.status).toBe("Trial");
    });
  });

  describe("Combined Alerts", () => {
    it("should handle subscriptions that are both low usage and upcoming renewal", () => {
      const now = new Date();

      // Subscription that is both low usage AND renewing soon
      createSubscription({
        name: "Low Usage + Renewing",
        provider: "Test",
        amount: 50.0,
        nextBilling: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Active",
        lastUsed: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
      });

      const lowUsage = getLowUsageSubscriptions();
      const upcoming = getUpcomingRenewals();

      expect(lowUsage.some((s) => s.name === "Low Usage + Renewing")).toBe(true);
      expect(upcoming.some((s) => s.name === "Low Usage + Renewing")).toBe(true);
    });
  });
});

