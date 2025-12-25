import express from "express";
import { parseEmailForSubscription } from "../services/emailParser.js";
import { ensureSubscription } from "../data/subscriptions.js";
import { authMiddleware } from "../auth/jwt.js";
import {
  getGmailAuthUrl,
  getGmailTokens,
  createGmailClient,
  fetchGmailMessages,
  parseGmailMessage,
  getGmailUserEmail
} from "../services/gmailService.js";
import {
  saveEmailConnection,
  getEmailConnection,
  updateLastScan,
  deleteEmailConnection
} from "../data/emailConnections.js";
import { FRONTEND_URL, EMAIL_TEST_MODE } from "../config/env.js";

const router = express.Router();

// Initiate Gmail OAuth connection
router.post("/connect", authMiddleware, (req, res) => {
  const { emailProvider = "gmail" } = req.body;
  const userId = req.user.id;
  
  if (emailProvider !== "gmail") {
    return res.status(400).json({
      success: false,
      error: "Only Gmail is currently supported"
    });
  }
  
  // Test mode: Simulate connection without OAuth
  if (EMAIL_TEST_MODE) {
    const mockTokens = {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token"
    };
    
    saveEmailConnection(userId, "gmail", mockTokens, `${req.user.email}`);
    
    return res.json({
      success: true,
      message: "Email connected (TEST MODE)",
      emailProvider: "gmail",
      testMode: true,
      // No oauthUrl in test mode - connection is immediate
    });
  }
  
  try {
    const authUrl = getGmailAuthUrl(userId);
    res.json({
      success: true,
      message: "Gmail OAuth URL generated",
      emailProvider: "gmail",
      oauthUrl: authUrl
    });
  } catch (error) {
    console.error("Error generating Gmail auth URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate OAuth URL. Set EMAIL_TEST_MODE=true to test without OAuth setup."
    });
  }
});

// Gmail OAuth callback
router.get("/gmail/callback", async (req, res) => {
  const { code, state: userId, error } = req.query;
  
  if (error) {
    return res.redirect(`${FRONTEND_URL}/demo?error=gmail_auth_failed`);
  }
  
  if (!code || !userId) {
    return res.redirect(`${FRONTEND_URL}/demo?error=missing_params`);
  }
  
  try {
    // Exchange code for tokens
    const tokens = await getGmailTokens(code);
    
    // Create Gmail client to get user's email
    const gmailClient = createGmailClient(tokens.access_token, tokens.refresh_token);
    const emailAddress = await getGmailUserEmail(gmailClient);
    
    // Save connection
    saveEmailConnection(userId, "gmail", tokens, emailAddress);
    
    // Redirect to frontend with success
    res.redirect(`${FRONTEND_URL}/demo?email_connected=true`);
  } catch (error) {
    console.error("Error in Gmail callback:", error);
    res.redirect(`${FRONTEND_URL}/demo?error=gmail_connection_failed`);
  }
});

// Scan emails for subscriptions using Gmail API
router.post("/scan", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if email is connected
    const connection = getEmailConnection(userId);
    if (!connection) {
      return res.status(400).json({
        success: false,
        error: "Email account not connected. Please connect your Gmail account first."
      });
    }
    
    // Test mode: Return mock email scan results
    if (EMAIL_TEST_MODE && connection.accessToken === "test-access-token") {
      const mockEmails = [
        {
          subject: "Your Netflix subscription has been renewed",
          body: "Thank you for your payment of AED 55.00. Your next billing date is February 15, 2024.",
          from: "billing@netflix.com",
          date: new Date().toISOString()
        },
        {
          subject: "Spotify Premium - Payment Receipt",
          body: "You've been charged AED 25.00 for your Spotify Premium subscription. Next billing: 02/20/2024",
          from: "noreply@spotify.com",
          date: new Date().toISOString()
        },
        {
          subject: "Adobe Creative Cloud Invoice",
          body: "Your monthly subscription payment of AED 120.00 has been processed. Renewal date: 2024-02-25",
          from: "adobe@adobe.com",
          date: new Date().toISOString()
        }
      ];
      
      const detectedSubscriptions = [];
      for (const email of mockEmails) {
        const subscription = parseEmailForSubscription(email);
        if (subscription) {
          detectedSubscriptions.push(subscription);
        }
      }
      
      const created = [];
      for (const subData of detectedSubscriptions) {
        const subscription = ensureSubscription(subData);
        const isNew = !subscription.id || 
          (subscription.id && !created.find(c => c.id === subscription.id));
        if (isNew) {
          created.push(subscription);
        }
      }
      
      updateLastScan(userId, new Date().toISOString());
      
      return res.json({
        success: true,
        message: `Scanned ${mockEmails.length} email(s) (TEST MODE), found ${detectedSubscriptions.length} subscription(s)`,
        emailsScanned: mockEmails.length,
        detected: detectedSubscriptions.length,
        created: created.length,
        subscriptions: created,
        testMode: true
      });
    }
    
    // Real Gmail API mode
    // Create Gmail client
    const gmailClient = createGmailClient(
      connection.accessToken,
      connection.refreshToken
    );
    
    // Fetch emails from Gmail
    const messages = await fetchGmailMessages(gmailClient, 50);
    
    // Parse emails and extract subscriptions
    const detectedSubscriptions = [];
    for (const message of messages) {
      const emailData = parseGmailMessage(message);
      const subscription = parseEmailForSubscription(emailData);
      
      if (subscription) {
        detectedSubscriptions.push(subscription);
      }
    }
    
    // Create subscriptions (avoid duplicates)
    const created = [];
    for (const subData of detectedSubscriptions) {
      const subscription = ensureSubscription(subData);
      // Check if this is a new subscription
      const isNew = !subscription.id || 
        (subscription.id && !created.find(c => c.id === subscription.id));
      if (isNew) {
        created.push(subscription);
      }
    }
    
    // Update last scan timestamp
    updateLastScan(userId, new Date().toISOString());
    
    res.json({
      success: true,
      message: `Scanned ${messages.length} email(s), found ${detectedSubscriptions.length} subscription(s)`,
      emailsScanned: messages.length,
      detected: detectedSubscriptions.length,
      created: created.length,
      subscriptions: created
    });
  } catch (error) {
    console.error("Error scanning emails:", error);
    
    // Check if it's an auth error (token expired)
    if (error.message?.includes("Invalid Credentials") || error.code === 401) {
      // Delete connection so user can reconnect
      deleteEmailConnection(req.user.id);
      return res.status(401).json({
        success: false,
        error: "Gmail access token expired. Please reconnect your Gmail account.",
        requiresReconnect: true
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to scan emails: " + (error.message || "Unknown error")
    });
  }
});

// Get email connection status
router.get("/status", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const connection = getEmailConnection(userId);
  
  if (!connection) {
    return res.json({
      connected: false,
      emailProvider: null,
      emailAddress: null,
      lastScan: null
    });
  }
  
  res.json({
    connected: true,
    emailProvider: connection.provider,
    emailAddress: connection.emailAddress,
    connectedAt: connection.connectedAt,
    lastScan: connection.lastScan
  });
});

// Disconnect email account
router.delete("/disconnect", authMiddleware, (req, res) => {
  const userId = req.user.id;
  deleteEmailConnection(userId);
  
  res.json({
    success: true,
    message: "Email account disconnected"
  });
});

export default router;

