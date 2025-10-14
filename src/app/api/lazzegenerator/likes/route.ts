import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lazzegenerator_likes (
      id INTEGER PRIMARY KEY DEFAULT 1,
      count INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO lazzegenerator_likes (id, count)
    VALUES (1, 420)
    ON CONFLICT (id) DO NOTHING;
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const { rows } = await pool.query(
      "SELECT count FROM lazzegenerator_likes WHERE id = 1"
    );
    const count = rows[0]?.count ?? 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST() {
  try {
    await ensureTable();
    const { rows } = await pool.query(
      "UPDATE lazzegenerator_likes SET count = count + 1 WHERE id = 1 RETURNING count"
    );
    const count = rows[0]?.count ?? 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error incrementing likes:", error);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }
}
