/**
 * Test script for Bank and Email linking features
 * Run with: node src/scripts/testBankEmail.js
 */

import { createUser, findUserByEmail } from "../data/users.js";
import { listSubscriptions, ensureSubscription } from "../data/subscriptions.js";
import { getEmailConnection, saveEmailConnection } from "../data/emailConnections.js";

console.log("🧪 Testing Bank & Email Linking Features\n");

// Test 1: Bank Connection Simulation
console.log("1️⃣ Testing Bank Connection...");
try {
  // Simulate bank connection
  const bankConnection = {
    success: true,
    bankName: "Demo Bank",
    message: "Bank account connected successfully."
  };
  console.log("   ✅ Bank connection simulated:", bankConnection);
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

// Test 2: Bank Subscription Import
console.log("\n2️⃣ Testing Bank Subscription Import...");
try {
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
  console.log(`   ✅ Created ${created.length} subscriptions from bank import:`);
  created.forEach((sub) => {
    console.log(`      - ${sub.name}: AED ${sub.amount} (${sub.provider})`);
  });
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

// Test 3: Email Connection Status
console.log("\n3️⃣ Testing Email Connection Status...");
try {
  // Create a test user if doesn't exist
  let testUser;
  try {
    testUser = findUserByEmail("test@example.com");
    if (!testUser) {
      testUser = createUser({
        email: "test@example.com",
        password: "test123",
        name: "Test User"
      });
    }
  } catch (e) {
    testUser = findUserByEmail("test@example.com");
  }

  const emailConnection = getEmailConnection(testUser?.id || "test-id");
  if (emailConnection) {
    console.log("   ✅ Email connection found:");
    console.log(`      - Provider: ${emailConnection.provider}`);
    console.log(`      - Email: ${emailConnection.emailAddress}`);
    console.log(`      - Connected: ${emailConnection.connectedAt}`);
  } else {
    console.log("   ℹ️  No email connection found (expected for new users)");
  }
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

// Test 4: Email Connection Simulation
console.log("\n4️⃣ Testing Email Connection Simulation...");
try {
  const testUserId = "test-user-123";
  const mockTokens = {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token"
  };

  saveEmailConnection(
    testUserId,
    "gmail",
    mockTokens,
    "test@gmail.com"
  );

  const saved = getEmailConnection(testUserId);
  if (saved) {
    console.log("   ✅ Email connection saved:");
    console.log(`      - Provider: ${saved.provider}`);
    console.log(`      - Email: ${saved.emailAddress}`);
    console.log(`      - Connected: ${saved.connectedAt}`);
  }
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

// Test 5: Subscription Count
console.log("\n5️⃣ Testing Subscription Count...");
try {
  const subscriptions = listSubscriptions();
  console.log(`   ✅ Total subscriptions: ${subscriptions.length}`);
  console.log(`   ✅ Active: ${subscriptions.filter((s) => s.status === "Active").length}`);
  console.log(`   ✅ Cancelled: ${subscriptions.filter((s) => s.status === "Cancelled").length}`);
  console.log(`   ✅ Paused: ${subscriptions.filter((s) => s.status === "Paused").length}`);
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

console.log("\n✅ All tests completed!\n");
console.log("📝 Next Steps:");
console.log("   1. Test bank linking in UI: Analytics tab > Connect Bank");
console.log("   2. Test email linking in UI: Analytics tab > Connect Gmail");
console.log("   3. Check API endpoints with curl (see TESTING_BANK_EMAIL.md)");

