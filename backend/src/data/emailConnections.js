// In-memory store for email connections (replace with MongoDB in production)
const emailConnections = {};

export function saveEmailConnection(userId, provider, tokens, emailAddress) {
  emailConnections[userId] = {
    provider,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    emailAddress,
    connectedAt: new Date().toISOString(),
    lastScan: null
  };
  return emailConnections[userId];
}

export function getEmailConnection(userId) {
  return emailConnections[userId] || null;
}

export function updateLastScan(userId, timestamp) {
  if (emailConnections[userId]) {
    emailConnections[userId].lastScan = timestamp;
  }
}

export function deleteEmailConnection(userId) {
  delete emailConnections[userId];
}

