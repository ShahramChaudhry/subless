// Email parser service to extract subscription information from emails
// In a real system, this would parse actual email content from Gmail API or IMAP

// Common subscription-related keywords
const SUBSCRIPTION_KEYWORDS = [
  "subscription",
  "renewal",
  "billing",
  "payment",
  "invoice",
  "receipt",
  "charge",
  "auto-renew",
  "recurring"
];

// Common service providers and their patterns
const SERVICE_PATTERNS = [
  { name: "Netflix", patterns: [/netflix/i], defaultAmount: 55 },
  { name: "Spotify", patterns: [/spotify/i], defaultAmount: 25 },
  { name: "Adobe", patterns: [/adobe/i, /creative cloud/i], defaultAmount: 120 },
  { name: "Amazon Prime", patterns: [/amazon prime/i, /prime video/i], defaultAmount: 16 },
  { name: "Disney+", patterns: [/disney\+/i, /disney plus/i], defaultAmount: 30 },
  { name: "Apple Music", patterns: [/apple music/i], defaultAmount: 20 },
  { name: "YouTube Premium", patterns: [/youtube premium/i, /youtube/i], defaultAmount: 40 },
  { name: "Microsoft 365", patterns: [/microsoft 365/i, /office 365/i], defaultAmount: 100 },
  { name: "Du", patterns: [/du/i, /du telecom/i], defaultAmount: 299 },
  { name: "Etisalat", patterns: [/etisalat/i], defaultAmount: 150 }
];

// Extract amount from text (looks for AED, USD, or numbers with currency symbols)
function extractAmount(text) {
  // Look for AED amounts
  const aedMatch = text.match(/AED\s*([\d,]+\.?\d*)/i) || text.match(/([\d,]+\.?\d*)\s*AED/i);
  if (aedMatch) {
    return parseFloat(aedMatch[1].replace(/,/g, ""));
  }
  
  // Look for USD amounts
  const usdMatch = text.match(/\$\s*([\d,]+\.?\d*)/) || text.match(/([\d,]+\.?\d*)\s*USD/i);
  if (usdMatch) {
    return parseFloat(usdMatch[1].replace(/,/g, ""));
  }
  
  // Look for generic currency patterns
  const genericMatch = text.match(/([\d,]+\.?\d*)\s*(?:dirham|dhs|dollar)/i);
  if (genericMatch) {
    return parseFloat(genericMatch[1].replace(/,/g, ""));
  }
  
  return null;
}

// Extract date from text (looks for common date patterns)
function extractDate(text) {
  // Look for dates like "January 15, 2024" or "15/01/2024" or "2024-01-15"
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Try to parse the date
        let dateStr;
        if (pattern === datePatterns[0]) {
          // DD/MM/YYYY or MM/DD/YYYY
          const [, a, b, year] = match;
          dateStr = `${year}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
        } else if (pattern === datePatterns[1]) {
          // YYYY-MM-DD
          dateStr = match[0];
        } else {
          // Month name format
          const monthNames = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
          ];
          const month = monthNames.indexOf(match[1].toLowerCase());
          const day = match[2].padStart(2, "0");
          const year = match[3];
          dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day}`;
        }
        
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return dateStr;
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  
  return null;
}

// Identify service provider from email content
function identifyService(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();
  
  for (const service of SERVICE_PATTERNS) {
    for (const pattern of service.patterns) {
      if (pattern.test(text)) {
        return {
          name: service.name,
          provider: service.name,
          defaultAmount: service.defaultAmount
        };
      }
    }
  }
  
  // If no match, try to extract from sender email domain
  return null;
}

// Parse email content to extract subscription information
export function parseEmailForSubscription(email) {
  const { subject = "", body = "", from = "", date } = email;
  
  // Check if email is subscription-related
  const text = `${subject} ${body}`.toLowerCase();
  const isSubscriptionRelated = SUBSCRIPTION_KEYWORDS.some(keyword =>
    text.includes(keyword)
  );
  
  if (!isSubscriptionRelated) {
    return null;
  }
  
  // Identify the service
  const service = identifyService(subject, body);
  if (!service) {
    return null;
  }
  
  // Extract amount
  const amount = extractAmount(`${subject} ${body}`) || service.defaultAmount;
  
  // Extract next billing date
  let nextBilling = extractDate(`${subject} ${body}`);
  
  // If no date found, calculate next month from email date or current date
  if (!nextBilling) {
    const baseDate = date ? new Date(date) : new Date();
    const nextMonth = new Date(baseDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextBilling = nextMonth.toISOString().split("T")[0];
  }
  
  return {
    name: service.name,
    provider: service.provider,
    amount: amount,
    nextBilling: nextBilling,
    status: "Active"
  };
}

// Simulate scanning emails (in real system, this would fetch from Gmail API or IMAP)
export function scanEmailsForSubscriptions(emailAccount) {
  // Demo email data that simulates real subscription emails
  const demoEmails = [
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
    },
    {
      subject: "Amazon Prime Membership Renewal",
      body: "Your Amazon Prime membership has been renewed. Amount charged: AED 16.00. Next renewal: March 1, 2024",
      from: "auto-confirm@amazon.ae",
      date: new Date().toISOString()
    },
    {
      subject: "Disney+ Subscription Payment",
      body: "Payment successful: AED 30.00. Your Disney+ subscription will renew on 02/18/2024",
      from: "disneyplus@disney.com",
      date: new Date().toISOString()
    }
  ];
  
  const subscriptions = [];
  
  for (const email of demoEmails) {
    const subscription = parseEmailForSubscription(email);
    if (subscription) {
      subscriptions.push(subscription);
    }
  }
  
  return subscriptions;
}

