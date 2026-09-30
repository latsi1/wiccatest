import { NextRequest, NextResponse } from "next/server";
import { withCommunity, currentMember, publicMember, newId, limit, CommunityError } from "@/lib/wiccers-store";
import { COOKIE, assertOrigin, readBody, failure } from "@/lib/wiccers-auth";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
    try {
        return await withCommunity(state => {
            const user = currentMember(state, request.cookies.get(COOKIE)?.value);
            const params = request.nextUrl.searchParams;
            const followersOf = params.get("followers");
            if (followersOf) {
                const member = state.members.find(m => m.id === followersOf);
                if (!member)
                    throw new CommunityError("This profile does not exist.", 404);
                const followerIds = new Set(state.follows.filter(f => f.to === member.id).map(f => f.from));
                const followers = state.members
                    .filter(m => followerIds.has(m.id))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(m => publicMember(state, m, user?.id));
                return NextResponse.json({ profile: publicMember(state, member, user?.id), followers }, { headers: { "Cache-Control": "no-store" } });
            }
            const view = params.get("view") ?? "all", search = (params.get("q") ?? "").slice(0, 100).toLowerCase(), profileId = params.get("profile"), thread = params.get("thread"), before = params.get("before");
            if (["following", "bookmarks"].includes(view) && !user)
                throw new CommunityError("Sign in to see your circle.", 401);
            const following = state.follows.filter(f => f.from === user?.id).map(f => f.to);
            let posts = state.posts.filter(p => thread ? p.parentId === thread : !p.parentId);
            if (view === "following")
                posts = posts.filter(p => following.includes(p.authorId) || p.reposts.some(id => following.includes(id)));
            if (view === "bookmarks")
                posts = posts.filter(p => state.bookmarks.some(b => b.memberId === user?.id && b.postId === p.id));
            if (profileId)
                posts = posts.filter(p => p.authorId === profileId || p.reposts.includes(profileId));
            if (search)
                posts = posts.filter(p => p.content.toLowerCase().includes(search) || state.members.find(m => m.id === p.authorId)?.name.toLowerCase().includes(search));
            posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
            if (before) {
                const index = posts.findIndex(p => p.id === before);
                if (index >= 0)
                    posts = posts.slice(index + 1);
                else
                    posts = [];
            }
            const page = posts.slice(0, 30);
            const serialize = (p: typeof page[number]) => ({ id: p.id, content: p.content, createdAt: p.createdAt, parentId: p.parentId, author: publicMember(state, state.members.find(m => m.id === p.authorId)!, user?.id), likes: p.likes.length, liked: p.likes.includes(user?.id ?? ""), reposts: p.reposts.length, reposted: p.reposts.includes(user?.id ?? ""), replies: state.posts.filter(r => r.parentId === p.id).length, bookmarked: state.bookmarks.some(b => b.memberId === user?.id && b.postId === p.id) });
            const profile = state.members.find(m => m.id === profileId);
            const tags = new Map<string, number>();
            state.posts.filter(p => !p.parentId).forEach(p => { for (const tag of new Set(p.content.match(/#[\p{L}\p{N}_]+/gu) ?? []))
                tags.set(tag, (tags.get(tag) ?? 0) + 1); });
            return NextResponse.json({ posts: page.map(serialize), next: posts.length > 30 ? page.at(-1)?.id : null, profile: profile ? publicMember(state, profile, user?.id) : null, members: state.members.filter(m => m.id !== user?.id && !m.archived).slice(-6).reverse().map(m => publicMember(state, m, user?.id)), trends: [...tags].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count })), totalMembers: state.members.filter(m => !m.archived).length, user: user ? publicMember(state, user, user.id) : null }, { headers: { "Cache-Control": "no-store" } });
        });
    }
    catch (error) {
        return failure(error);
    }
}
export async function POST(request: NextRequest) {
    try {
        assertOrigin(request);
        const body = await readBody(request);
        return await withCommunity(state => {
            const user = currentMember(state, request.cookies.get(COOKIE)?.value);
            if (!user)
                throw new CommunityError("Sign in to join the conversation.", 401);
            if (!limit(state, `write:${user.id}`, 90, 60000))
                return NextResponse.json({ error: "Take a breath. Please wait a minute." }, { status: 429 });
            if (body.action === "post") {
                const content = typeof body.content === "string" ? body.content.trim() : "";
                if (!content || content.length > 500)
                    throw new CommunityError("Write between 1 and 500 characters.");
                const parentId = typeof body.parentId === "string" ? body.parentId : null;
                if (parentId && !state.posts.some(p => p.id === parentId && !p.parentId))
                    throw new CommunityError("That conversation no longer exists.", 404);
                if (!limit(state, `post:${user.id}`, 10, 60000))
                    return NextResponse.json({ error: "Please wait a minute before posting again." }, { status: 429 });
                const post = { id: newId(), authorId: user.id, content, createdAt: new Date().toISOString(), parentId, likes: [], reposts: [] };
                state.posts.push(post);
                return NextResponse.json({ id: post.id }, { status: 201 });
            }
            if (body.action === "profile") {
                const bio = typeof body.bio === "string" ? body.bio.trim() : "";
                if (bio.length > 160 || !["sage", "violet", "amber", "rose"].includes(String(body.color)))
                    throw new CommunityError("Choose an avatar color and a bio up to 160 characters.");
                user.bio = bio;
                user.color = String(body.color);
                return NextResponse.json({ user: publicMember(state, user, user.id) });
            }
            if (body.action === "follow") {
                if (typeof body.memberId !== "string" || body.memberId === user.id || !state.members.some(m => m.id === body.memberId))
                    throw new CommunityError("Choose another member of the circle.");
                const index = state.follows.findIndex(f => f.from === user.id && f.to === body.memberId);
                if (index >= 0)
                    state.follows.splice(index, 1);
                else
                    state.follows.push({ from: user.id, to: body.memberId });
                return NextResponse.json({ following: index < 0 });
            }
            const post = state.posts.find(p => p.id === body.postId);
            if (!post)
                throw new CommunityError("This whisper no longer exists.", 404);
            if (body.action === "like" || body.action === "repost") {
                const list = body.action === "like" ? post.likes : post.reposts;
                const index = list.indexOf(user.id);
                if (index >= 0)
                    list.splice(index, 1);
                else
                    list.push(user.id);
                return NextResponse.json({ active: index < 0, count: list.length });
            }
            if (body.action === "bookmark") {
                const index = state.bookmarks.findIndex(b => b.memberId === user.id && b.postId === post.id);
                if (index >= 0)
                    state.bookmarks.splice(index, 1);
                else
                    state.bookmarks.push({ memberId: user.id, postId: post.id });
                return NextResponse.json({ active: index < 0 });
            }
            if (body.action === "delete") {
                if (post.authorId !== user.id)
                    throw new CommunityError("Only the author can remove this whisper.", 403);
                const removed = new Set([post.id, ...state.posts.filter(p => p.parentId === post.id).map(p => p.id)]);
                state.posts = state.posts.filter(p => !removed.has(p.id));
                state.bookmarks = state.bookmarks.filter(b => !removed.has(b.postId));
                return NextResponse.json({ deleted: true });
            }
            throw new CommunityError("Unknown action.");
        });
    }
    catch (error) {
        return failure(error);
    }
}
