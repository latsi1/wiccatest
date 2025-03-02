import { NextResponse } from "next/server";
import { Pool } from "pg";

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
  } catch (error) {
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
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
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
