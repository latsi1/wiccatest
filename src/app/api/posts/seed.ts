import { Pool } from "pg";
import { mockWiccaPosts } from "./mockData";

// This script can be run manually to seed the database with mock data

async function seedDatabase() {
  // Create a connection pool to the Neon database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const client = await pool.connect();
  try {
    console.log("Starting database seeding...");

    // First, clear existing posts if needed
    console.log("Clearing existing posts...");
    await client.query("DELETE FROM posts");

    // Use a transaction to ensure all inserts succeed or fail together
    await client.query("BEGIN");

    console.log("Adding mock data...");
    for (const post of mockWiccaPosts) {
      await client.query(
        "INSERT INTO posts (nickname, content, created_at) VALUES ($1, $2, $3)",
        [post.nickname, post.content, post.created_at]
      );
    }

    await client.query("COMMIT");
    console.log("Database seeded successfully with mock data");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding function
seedDatabase().catch(console.error);
