import { google } from "googleapis";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_CALLBACK_URL } from "../config/env.js";

// Create OAuth2 client for Gmail
export function createGmailOAuthClient() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GMAIL_CALLBACK_URL
  );
}

// Generate Gmail OAuth URL
export function getGmailAuthUrl(userId) {
  const oauth2Client = createGmailOAuthClient();
  
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly", // Read emails
    "https://www.googleapis.com/auth/userinfo.email"   // Get user email
  ];
  
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: userId // Pass user ID in state for security
  });
  
  return url;
}

// Exchange authorization code for tokens
export async function getGmailTokens(code) {
  const oauth2Client = createGmailOAuthClient();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Error getting Gmail tokens:", error);
    throw new Error("Failed to exchange authorization code");
  }
}

// Create Gmail API client with access token
export function createGmailClient(accessToken, refreshToken) {
  const oauth2Client = createGmailOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  
  return google.gmail({ version: "v1", auth: oauth2Client });
}

// Fetch emails from Gmail
export async function fetchGmailMessages(gmailClient, maxResults = 50) {
  try {
    // Search for subscription-related emails
    const query = "subject:(subscription OR renewal OR billing OR invoice OR payment OR receipt)";
    
    const response = await gmailClient.users.messages.list({
      userId: "me",
      q: query,
      maxResults: maxResults
    });
    
    const messages = response.data.messages || [];
    
    // Fetch full message details
    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        const message = await gmailClient.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full"
        });
        return message.data;
      })
    );
    
    return fullMessages;
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    throw new Error("Failed to fetch emails from Gmail");
  }
}

// Parse Gmail message to extract text content
export function parseGmailMessage(message) {
  let subject = "";
  let body = "";
  let from = "";
  let date = null;
  
  // Extract headers
  const headers = message.payload?.headers || [];
  for (const header of headers) {
    if (header.name === "Subject") subject = header.value;
    if (header.name === "From") from = header.value;
    if (header.name === "Date") date = header.value;
  }
  
  // Extract body text
  function extractBody(part) {
    if (part.body?.data) {
      return Buffer.from(part.body.data, "base64").toString("utf-8");
    }
    if (part.parts) {
      return part.parts.map(extractBody).join("\n");
    }
    return "";
  }
  
  body = extractBody(message.payload || {});
  
  return {
    subject,
    body,
    from,
    date: date ? new Date(date).toISOString() : new Date().toISOString()
  };
}

// Get user's email address from Gmail
export async function getGmailUserEmail(gmailClient) {
  try {
    const profile = await gmailClient.users.getProfile({
      userId: "me"
    });
    return profile.data.emailAddress;
  } catch (error) {
    console.error("Error getting Gmail profile:", error);
    return null;
  }
}

