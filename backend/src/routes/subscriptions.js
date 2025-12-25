import express from "express";
import {
  listSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  deleteSubscription,
  cancelSubscription,
  updateLastUsed,
  getLowUsageSubscriptions,
  getUpcomingRenewals
} from "../data/subscriptions.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(listSubscriptions());
});

router.post("/", (req, res) => {
  const { name, provider, amount, nextBilling, status } = req.body || {};

  if (!name || !provider || !nextBilling) {
    return res.status(400).json({
      error: "name, provider and nextBilling are required"
    });
  }

  const created = createSubscription({
    name,
    provider,
    amount,
    nextBilling,
    status
  });

  res.status(201).json(created);
});

router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  const updated = updateSubscriptionStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = deleteSubscription(id);

  if (!deleted) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  res.status(204).send();
});

// Cancel subscription (marks as cancelled but keeps in list)
router.post("/:id/cancel", (req, res) => {
  const { id } = req.params;
  const cancelled = cancelSubscription(id);

  if (!cancelled) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  res.json(cancelled);
});

// Update last used timestamp
router.patch("/:id/usage", (req, res) => {
  const { id } = req.params;
  const updated = updateLastUsed(id);

  if (!updated) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  res.json(updated);
});

// Get alerts (low usage + upcoming renewals)
router.get("/alerts", (req, res) => {
  const lowUsage = getLowUsageSubscriptions();
  const upcomingRenewals = getUpcomingRenewals();

  res.json({
    lowUsage: lowUsage.map((s) => ({
      id: s.id,
      name: s.name,
      provider: s.provider,
      amount: s.amount,
      lastUsed: s.lastUsed,
      daysSinceLastUse: Math.floor(
        (Date.now() - new Date(s.lastUsed).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    })),
    upcomingRenewals: upcomingRenewals.map((s) => ({
      id: s.id,
      name: s.name,
      provider: s.provider,
      amount: s.amount,
      nextBilling: s.nextBilling,
      status: s.status,
      daysUntilRenewal: Math.ceil(
        (new Date(s.nextBilling).getTime() - Date.now()) /
          (24 * 60 * 60 * 1000)
      )
    }))
  });
});

export default router;


