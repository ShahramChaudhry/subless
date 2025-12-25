import express from "express";
import { ensureSubscription } from "../data/subscriptions.js";

const router = express.Router();

// Simulated bank account linking + subscription discovery

// Pretend to "connect" to a bank. In a real app, you'd redirect to a provider
// like Stripe/Plaid here. For now we just acknowledge the request.
router.post("/connect", (req, res) => {
  const { bankName } = req.body || {};
  // In a real implementation, store bank credentials / access token
  // associated with the current user.
  res.json({
    success: true,
    bankName: bankName || "Demo Bank",
    message: "Bank account connected successfully."
  });
});

// Simulate pulling recurring transactions from a bank and creating
// subscription entries automatically.
router.post("/import-demo-subscriptions", (req, res) => {
  const demoCharges = [
    {
      name: "Amazon Prime",
      provider: "Amazon",
      amount: 16.0,
      nextBilling: "2024-02-05",
      status: "Active"
    },
    {
      name: "Du Home Internet",
      provider: "Du",
      amount: 299.0,
      nextBilling: "2024-02-12",
      status: "Active"
    },
    {
      name: "Xbox Game Pass",
      provider: "Microsoft",
      amount: 40.0,
      nextBilling: "2024-02-20",
      status: "Active"
    }
  ];

  const created = demoCharges.map((c) => ensureSubscription(c));

  res.json({
    success: true,
    created
  });
});

export default router;


