import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  return NextResponse.json({
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyStart: apiKey ? `${apiKey.substring(0, 4)}...` : "not found",
  });
}
