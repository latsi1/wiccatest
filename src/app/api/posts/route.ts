import { NextResponse } from "next/server";
import { Pool } from "pg";
import { mockWiccaPosts } from "./mockData";

// Create a connection pool to the Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize the database table if it doesn't exist
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log("Initializing database table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database table initialized successfully");

    // Check if there are any posts in the database
    const result = await client.query("SELECT COUNT(*) FROM posts");
    const count = parseInt(result.rows[0].count);

    // If no posts exist, insert the mock data
    if (count === 0) {
      console.log("No posts found in database. Adding mock data...");

      // Use a transaction to ensure all inserts succeed or fail together
      await client.query("BEGIN");

      for (const post of mockWiccaPosts) {
        await client.query(
          "INSERT INTO posts (nickname, content, created_at) VALUES ($1, $2, $3)",
          [post.nickname, post.content, post.created_at]
        );
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
  } finally {
    client.release();
  }
}

// Initialize the database when the module is loaded
initializeDatabase().catch(console.error);

// GET handler to fetch all posts
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM posts ORDER BY created_at DESC"
      );
      return NextResponse.json({ posts: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return mock data if database connection fails or in development mode
    console.log("Using mock data for posts");
    return NextResponse.json({ posts: mockWiccaPosts });
  }
}

// POST handler to create a new post
export async function POST(request: Request) {
  try {
    const { nickname, content } = await request.json();

    // Validate input
    if (!nickname || !content) {
      return NextResponse.json(
        { error: "Nickname and content are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO posts (nickname, content) VALUES ($1, $2) RETURNING *",
        [nickname, content]
      );
      return NextResponse.json({ post: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Delete the post with the given ID
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
