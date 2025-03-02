import { NextResponse } from "next/server";
import { Pool } from "pg";
import { mockWiccaPosts } from "../posts/mockData";

// Create a connection pool to the Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET handler to seed the database
export async function GET() {
  const client = await pool.connect();
  try {
    console.log("Starting database seeding from API...");

    // First, clear existing posts
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with mock data",
      posts: mockWiccaPosts.length,
    });
  } catch (error) {
    if (client.query) {
      await client.query("ROLLBACK");
    }
    console.error("Error seeding database:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
