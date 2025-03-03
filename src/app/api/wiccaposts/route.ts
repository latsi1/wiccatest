import { NextResponse } from "next/server";
import { Pool, PoolClient } from "pg";
import { mockWiccaPosts } from "../posts/mockData";

interface Post {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  parent_id?: number | null;
  votes: number;
  replies?: Post[];
}

// Create a connection pool to the Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Recursive function to insert a post and its replies
async function insertPost(
  client: PoolClient,
  post: Post,
  parentId: number | null = null
) {
  const randomVotes = Math.floor(Math.random() * 21) - 10;
  const result = await client.query(
    "INSERT INTO posts (nickname, content, created_at, votes, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [post.nickname, post.content, post.created_at, randomVotes, parentId]
  );
  const newId = result.rows[0].id;

  // Recursively insert all replies
  if (post.replies && post.replies.length > 0) {
    for (const reply of post.replies) {
      await insertPost(client, reply, newId);
    }
  }
}

// Initialize the database table if it doesn't exist
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log("Initializing database table...");

    // Drop the existing table if it exists
    await client.query(`DROP TABLE IF EXISTS posts CASCADE`);

    // Create the table with the correct schema
    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        parent_id INTEGER REFERENCES posts(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        votes INTEGER DEFAULT 0
      )
    `);
    console.log("Database table initialized successfully");

    // Check if there are any posts in the database
    const result = await client.query("SELECT COUNT(*) FROM posts");
    const count = parseInt(result.rows[0].count);

    // If no posts exist, insert the mock data recursively
    if (count === 0) {
      console.log("No posts found in database. Adding mock data...");

      // Use a transaction to ensure all inserts succeed or fail together
      await client.query("BEGIN");

      // Insert all posts recursively
      for (const post of mockWiccaPosts) {
        await insertPost(client, post);
      }

      await client.query("COMMIT");
      console.log("Mock data added successfully to database");
    } else {
      console.log(`Found ${count} existing posts in database`);
    }
  } catch (error) {
    if (client.query) {
      await client.query("ROLLBACK");
    }
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

// GET handler to initialize and seed the database
export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({
      success: true,
      message: "Database initialized and seeded successfully",
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
