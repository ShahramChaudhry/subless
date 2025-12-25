import { createUser } from "../data/users.js";
import { createSubscription, updateSubscriptionStatus, cancelSubscription } from "../data/subscriptions.js";
import { saveEmailConnection } from "../data/emailConnections.js";

// Create test users
export function seedTestUsers() {
  const users = [];

  // User 1: Active user with multiple subscriptions
  try {
    const user1 = createUser({
      email: "fatima.ahmed@example.com",
      password: "test123",
      name: "Fatima Ahmed"
    });
    users.push(user1);
    console.log("✓ Created user: Fatima Ahmed");
  } catch (e) {
    console.log("User 1 already exists or error:", e.message);
  }

  // User 2: User with low usage subscriptions
  try {
    const user2 = createUser({
      email: "omar.khalid@example.com",
      password: "test123",
      name: "Omar Khalid"
    });
    users.push(user2);
    console.log("✓ Created user: Omar Khalid");
  } catch (e) {
    console.log("User 2 already exists or error:", e.message);
  }

  // User 3: User with upcoming renewals
  try {
    const user3 = createUser({
      email: "reem.sultan@example.com",
      password: "test123",
      name: "Reem Sultan"
    });
    users.push(user3);
    console.log("✓ Created user: Reem Sultan");
  } catch (e) {
    console.log("User 3 already exists or error:", e.message);
  }

  // User 4: User with cancelled subscriptions
  try {
    const user4 = createUser({
      email: "amna.hassan@example.com",
      password: "test123",
      name: "Amna Hassan"
    });
    users.push(user4);
    console.log("✓ Created user: Amna Hassan");
  } catch (e) {
    console.log("User 4 already exists or error:", e.message);
  }

  return users;
}

// Create test subscriptions for different scenarios
export function seedTestSubscriptions() {
  const now = new Date();
  const subscriptions = [];

  // Active subscriptions with recent usage
  subscriptions.push(
    createSubscription({
      name: "Netflix Premium",
      provider: "Netflix",
      amount: 55.0,
      nextBilling: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 20 days from now
      status: "Active",
      lastUsed: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() // Used 2 days ago
    })
  );

  subscriptions.push(
    createSubscription({
      name: "Spotify Premium",
      provider: "Spotify",
      amount: 25.0,
      nextBilling: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days from now
      status: "Active",
      lastUsed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() // Used yesterday
    })
  );

  // Low usage subscriptions (not used in 14+ days)
  subscriptions.push(
    createSubscription({
      name: "Adobe Creative Cloud",
      provider: "Adobe",
      amount: 120.0,
      nextBilling: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active",
      lastUsed: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() // Not used in 20 days
    })
  );

  subscriptions.push(
    createSubscription({
      name: "Disney+",
      provider: "Disney",
      amount: 30.0,
      nextBilling: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active",
      lastUsed: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString() // Not used in 18 days
    })
  );

  subscriptions.push(
    createSubscription({
      name: "Amazon Prime",
      provider: "Amazon",
      amount: 16.0,
      nextBilling: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active",
      lastUsed: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString() // Not used in 25 days
    })
  );

  // Upcoming renewals (within 7 days)
  subscriptions.push(
    createSubscription({
      name: "Starzplay",
      provider: "Starzplay",
      amount: 35.0,
      nextBilling: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Renews in 3 days
      status: "Active",
      lastUsed: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    })
  );

  subscriptions.push(
    createSubscription({
      name: "Apple Music",
      provider: "Apple",
      amount: 19.99,
      nextBilling: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Renews in 5 days
      status: "Active",
      lastUsed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    })
  );

  // Trial expiring soon
  subscriptions.push(
    createSubscription({
      name: "YouTube Premium",
      provider: "Google",
      amount: 29.0,
      nextBilling: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Trial ends in 2 days
      status: "Trial",
      lastUsed: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    })
  );

  // Cancelled subscriptions
  const cancelled1 = createSubscription({
    name: "HBO Max",
    provider: "HBO",
    amount: 45.0,
    nextBilling: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Active",
    lastUsed: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  });
  cancelSubscription(cancelled1.id);
  subscriptions.push(cancelled1);

  const cancelled2 = createSubscription({
    name: "Shahid VIP",
    provider: "Shahid",
    amount: 40.0,
    nextBilling: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Active",
    lastUsed: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
  });
  cancelSubscription(cancelled2.id);
  subscriptions.push(cancelled2);

  // Paused subscription
  subscriptions.push(
    createSubscription({
      name: "Etisalat Mobile",
      provider: "Etisalat",
      amount: 150.0,
      nextBilling: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Paused",
      lastUsed: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
    })
  );

  console.log(`✓ Created ${subscriptions.length} test subscriptions`);
  return subscriptions;
}

// Seed email connections
export function seedEmailConnections() {
  // Note: In a real scenario, you'd need actual user IDs
  // This is just for demonstration
  console.log("✓ Email connections would be seeded here (requires user IDs)");
}

// Main seeding function
export function seedAll() {
  console.log("🌱 Seeding test data...\n");
  
  const users = seedTestUsers();
  console.log("");
  
  const subscriptions = seedTestSubscriptions();
  console.log("");
  
  seedEmailConnections();
  console.log("");
  
  console.log("✅ Test data seeding complete!");
  console.log("\nTest Users:");
  console.log("  - fatima.ahmed@example.com / test123");
  console.log("  - omar.khalid@example.com / test123");
  console.log("  - reem.sultan@example.com / test123");
  console.log("  - amna.hassan@example.com / test123");
  console.log("\nTest Subscriptions:");
  console.log(`  - ${subscriptions.length} subscriptions created`);
  console.log("  - Includes: Active, Low Usage, Upcoming Renewals, Trials, Cancelled, Paused");
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("seedTestData.js")) {
  seedAll();
}

