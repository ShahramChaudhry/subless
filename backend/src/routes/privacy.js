import express from "express";
import { authMiddleware } from "../auth/jwt.js";
import {
  getEmailConnection,
  deleteEmailConnection
} from "../data/emailConnections.js";
import { listSubscriptions, deleteSubscription } from "../data/subscriptions.js";

const router = express.Router();

// Get user's privacy/data overview
router.get("/overview", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const emailConnection = getEmailConnection(userId);
  const subscriptions = listSubscriptions();

  res.json({
    connectedAccounts: {
      email: emailConnection
        ? {
            provider: emailConnection.provider,
            emailAddress: emailConnection.emailAddress,
            connectedAt: emailConnection.connectedAt
          }
        : null,
      bank: null // Add bank connection check when implemented
    },
    dataSummary: {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(
        (s) => s.status === "Active"
      ).length
    }
  });
});

// Disconnect email account
router.delete("/email", authMiddleware, (req, res) => {
  const userId = req.user.id;
  deleteEmailConnection(userId);

  res.json({
    success: true,
    message: "Email account disconnected"
  });
});

// Export user data
router.get("/export", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const emailConnection = getEmailConnection(userId);
  const subscriptions = listSubscriptions();

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: userId,
      email: req.user.email,
      name: req.user.name
    },
    connectedAccounts: {
      email: emailConnection
        ? {
            provider: emailConnection.provider,
            emailAddress: emailConnection.emailAddress,
            connectedAt: emailConnection.connectedAt
          }
        : null
    },
    subscriptions: subscriptions.map((s) => ({
      name: s.name,
      provider: s.provider,
      amount: s.amount,
      status: s.status,
      nextBilling: s.nextBilling,
      lastUsed: s.lastUsed,
      cancelledAt: s.cancelledAt
    }))
  };

  res.json(exportData);
});

// Delete all user data
router.delete("/data", authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Disconnect email
  deleteEmailConnection(userId);

  // Delete all subscriptions (in production, filter by userId)
  const subscriptions = listSubscriptions();
  subscriptions.forEach((s) => {
    deleteSubscription(s.id);
  });

  res.json({
    success: true,
    message: "All user data deleted"
  });
});

export default router;

