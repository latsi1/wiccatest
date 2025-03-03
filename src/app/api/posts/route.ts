import { NextResponse } from "next/server";
import { Pool, PoolClient } from "pg";
import { mockWiccaPosts } from "./mockData";

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
      const result = await client.query(`
        WITH RECURSIVE post_tree AS (
          SELECT
            id,
            nickname,
            content,
            created_at,
            parent_id,
            votes,
            0 AS level,
            ARRAY[id] AS path
          FROM posts
          WHERE parent_id IS NULL

          UNION ALL

          SELECT
            p.id,
            p.nickname,
            p.content,
            p.created_at,
            p.parent_id,
            p.votes,
            pt.level + 1,
            pt.path || p.id
          FROM posts p
          INNER JOIN post_tree pt ON p.parent_id = pt.id
        )
        SELECT * FROM post_tree ORDER BY path;
      `);

      const postsMap = new Map<number, Post>();
      const rootPosts: Post[] = [];

      result.rows.forEach((post: Post) => {
        post.replies = [];
        postsMap.set(post.id, post);

        if (post.parent_id) {
          const parent = postsMap.get(post.parent_id);
          if (parent) {
            parent.replies!.push(post);
          }
        } else {
          rootPosts.push(post);
        }
      });

      return NextResponse.json({ posts: rootPosts });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ posts: mockWiccaPosts });
  }
}

// POST handler to create a new post or reply
export async function POST(request: Request) {
  try {
    const { nickname, content, parent_id } = await request.json();

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
        `INSERT INTO posts (nickname, content, parent_id, votes) 
         VALUES ($1, $2, $3, 0) 
         RETURNING id, nickname, content, created_at, parent_id, votes`,
        [nickname, content, parent_id || null]
      );

      if (result.rows.length === 0) {
        throw new Error("Failed to create post");
      }

      const post = result.rows[0];
      return NextResponse.json({
        post: {
          ...post,
          replies: [],
        },
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    // Delete the post and all its replies
    await pool.query("DELETE FROM posts WHERE id = $1 OR parent_id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

// Add new PUT handler for voting
export async function PUT(request: Request) {
  try {
    const { id, vote, undo, change, voteValue } = await request.json();

    if (!id || !vote) {
      return NextResponse.json(
        { error: "Post ID and vote type are required" },
        { status: 400 }
      );
    }

    if (vote !== "up" && vote !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    let finalVoteValue;
    if (undo) {
      // When undoing a vote, use the provided voteValue
      finalVoteValue = voteValue;
    } else if (change) {
      // When changing a vote, apply double the vote value to account for the previous vote
      finalVoteValue = vote === "up" ? 2 : -2;
    } else {
      // Normal vote
      finalVoteValue = vote === "up" ? 1 : -1;
    }

    const result = await pool.query(
      `UPDATE posts 
       SET votes = votes + $1 
       WHERE id = $2 
       RETURNING *`,
      [finalVoteValue, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: result.rows[0] });
  } catch (error) {
    console.error("Error updating post vote:", error);
    return NextResponse.json(
      { error: "Failed to update post vote" },
      { status: 500 }
    );
  }
}
