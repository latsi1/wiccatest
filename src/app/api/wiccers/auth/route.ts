import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { del } from "@vercel/blob";
import { withCommunity, currentMember, publicMember, limit, tokenHash, newId, CommunityError, storageMode } from "@/lib/wiccers-store";
import { COOKIE, SESSION_AGE, assertOrigin, readBody, failure, hashPassword, verifyPassword, sessionCookie } from "@/lib/wiccers-auth";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
    try {
        return await withCommunity(state => { const user = currentMember(state, request.cookies.get(COOKIE)?.value); return NextResponse.json({ user: user ? publicMember(state, user, user.id) : null, storage: storageMode() }, { headers: { "Cache-Control": "no-store" } }); });
    }
    catch (error) {
        return failure(error);
    }
}
export async function POST(request: NextRequest) {
    try {
        assertOrigin(request);
        const body = await readBody(request);
        if (body.action === "delete-account") {
            const token = request.cookies.get(COOKIE)?.value;
            const member = await withCommunity(state => {
                const user = currentMember(state, token);
                if (!user) throw new CommunityError("Sign in to manage your account.", 401);
                if (!limit(state, `delete-account:${user.id}`, 5, 15 * 60 * 1000))
                    throw new CommunityError("Too many attempts. Please wait 15 minutes.", 429);
                return { id: user.id, passwordHash: user.passwordHash };
            });
            if (typeof body.password !== "string" || body.password.length > 128 || !(await verifyPassword(body.password, member.passwordHash)))
                throw new CommunityError("Password is incorrect.", 401);
            const imageUrls = await withCommunity(state => {
                const user = currentMember(state, token);
                if (!user || user.id !== member.id || user.passwordHash !== member.passwordHash)
                    throw new CommunityError("Sign in again before deleting your account.", 401);
                const ownPosts = state.posts.filter(post => post.authorId === user.id);
                const roots = new Set(ownPosts.filter(post => !post.parentId).map(post => post.id));
                const removed = new Set([...ownPosts.map(post => post.id), ...state.posts.filter(post => post.parentId && roots.has(post.parentId)).map(post => post.id)]);
                const urls = new Set([...ownPosts.flatMap(post => post.image ? [post.image.url] : []), ...(state.uploads ?? []).filter(image => image.memberId === user.id).map(image => image.url)]);
                state.posts = state.posts.filter(post => !removed.has(post.id));
                for (const post of state.posts) {
                    post.likes = post.likes.filter(id => id !== user.id);
                    post.reposts = post.reposts.filter(id => id !== user.id);
                }
                state.members = state.members.filter(m => m.id !== user.id);
                state.sessions = state.sessions.filter(session => session.memberId !== user.id);
                state.follows = state.follows.filter(follow => follow.from !== user.id && follow.to !== user.id);
                state.bookmarks = state.bookmarks.filter(bookmark => bookmark.memberId !== user.id && !removed.has(bookmark.postId));
                state.uploads = (state.uploads ?? []).filter(image => image.memberId !== user.id);
                state.limits = state.limits.filter(entry => !entry.key.endsWith(`:${user.id}`));
                return [...urls];
            });
            let imagesRemoved = true;
            if (imageUrls.length) {
                try { await del(imageUrls); }
                catch { imagesRemoved = false; console.error("Account deleted, but Blob image cleanup failed."); }
            }
            return sessionCookie(NextResponse.json({ user: null, deleted: true, imagesRemoved }), "", 0);
        }
        if (body.action === "logout") {
            await withCommunity(state => { const hash = tokenHash(request.cookies.get(COOKIE)?.value ?? ""); state.sessions = state.sessions.filter(s => s.hash !== hash); });
            return sessionCookie(NextResponse.json({ user: null }), "", 0);
        }
        const name = typeof body.name === "string" ? body.name.trim().normalize("NFKC") : "";
        const password = typeof body.password === "string" ? body.password : "";
        if (!/^[\p{L}\p{N}_-]{3,24}$/u.test(name) || password.length < 8 || password.length > 128 || !["login", "register"].includes(String(body.action)))
            throw new CommunityError("Use a name of 3–24 letters, numbers, _ or -, and a password of 8–128 characters.");
        const key = name.toLowerCase();
        const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
        const allowed = await withCommunity(state => limit(state, `auth:${tokenHash(address)}`, 15, 15 * 60 * 1000) && limit(state, `name:${key}`, 10, 15 * 60 * 1000));
        if (!allowed)
            throw new CommunityError("Too many attempts. Please wait 15 minutes.", 429);
        const stored = await withCommunity(state => state.members.find(m => m.key === key));
        // Run the expensive password check outside the storage transaction.
        const dummy = "00000000000000000000000000000000:" + "00".repeat(64);
        if (body.action === "login" && !(await verifyPassword(password, stored?.passwordHash || dummy)))
            throw new CommunityError("Name or password is incorrect.", 401);
        const passwordHash = body.action === "register" ? await hashPassword(password) : "";
        const token = randomBytes(32).toString("hex");
        const user = await withCommunity(state => {
            let member = state.members.find(m => m.key === key);
            if (body.action === "register") {
                if (member)
                    throw new CommunityError("That name already belongs to someone in the circle.", 409);
                member = { id: newId(), name, key, passwordHash, bio: "", color: "sage", createdAt: new Date().toISOString() };
                state.members.push(member);
            }
            if (!member || member.archived)
                throw new CommunityError("Name or password is incorrect.", 401);
            if (body.action === "login" && (member.id !== stored?.id || member.passwordHash !== stored.passwordHash))
                throw new CommunityError("Name or password is incorrect.", 401);
            const previous = request.cookies.get(COOKIE)?.value;
            state.sessions = state.sessions.filter(s => s.expires > Date.now() && (!previous || s.hash !== tokenHash(previous)));
            state.sessions.push({ hash: tokenHash(token), memberId: member.id, expires: Date.now() + SESSION_AGE * 1000 });
            return publicMember(state, member, member.id);
        });
        return sessionCookie(NextResponse.json({ user }), token);
    }
    catch (error) {
        return failure(error);
    }
}
