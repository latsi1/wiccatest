import "server-only";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { CommunityError } from "./wiccers-store";
const derive = promisify(scrypt);
export const COOKIE = "wiccers_session";
export const SESSION_AGE = 60 * 60 * 24 * 30;
export async function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); const hash = await derive(password, salt, 64) as Buffer; return `${salt}:${hash.toString("hex")}`; }
export async function verifyPassword(password: string, stored: string) { const [salt, hex] = stored.split(":"); if (!salt || !hex)
    return false; const hash = await derive(password, salt, 64) as Buffer; const expected = Buffer.from(hex, "hex"); return hash.length === expected.length && timingSafeEqual(hash, expected); }
export function assertOrigin(request: NextRequest) { const origin = request.headers.get("origin"); if (!origin || origin !== new URL(request.url).origin)
    throw new CommunityError("This request must come from Wiccers.", 403); }
export async function readBody(request: NextRequest) { if (Number(request.headers.get("content-length")) > 8192)
    throw new CommunityError("Request is too large.", 413); const text = await request.text(); if (text.length > 8192)
    throw new CommunityError("Request is too large.", 413); try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body))
        throw new Error();
    return body as Record<string, unknown>;
}
catch {
    throw new CommunityError("Invalid request.");
} }
export function failure(error: unknown) { if (error instanceof CommunityError)
    return NextResponse.json({ error: error.message }, { status: error.status }); console.error("Wiccers request failed:", error instanceof Error ? error.message : "Unknown error"); return NextResponse.json({ error: "The circle is unavailable. Please try again shortly." }, { status: 503 }); }
export function sessionCookie(response: NextResponse, token: string, maxAge = SESSION_AGE) { response.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge }); return response; }
