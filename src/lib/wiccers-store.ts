import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
export interface Member {
    id: string;
    name: string;
    key: string;
    passwordHash: string;
    bio: string;
    color: string;
    createdAt: string;
    archived?: boolean;
}
export interface Whisper {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    likes: string[];
    reposts: string[];
}
export interface CommunityState {
    members: Member[];
    posts: Whisper[];
    sessions: {
        hash: string;
        memberId: string;
        expires: number;
    }[];
    follows: {
        from: string;
        to: string;
    }[];
    bookmarks: {
        memberId: string;
        postId: string;
    }[];
    limits: {
        key: string;
        count: number;
        expires: number;
    }[];
    importedLegacy: boolean;
}
const empty = (): CommunityState => ({ members: [], posts: [], sessions: [], follows: [], bookmarks: [], limits: [], importedLegacy: false });
const globalStore = globalThis as typeof globalThis & {
    wiccersPool?: Pool;
    wiccersQueue?: Promise<unknown>;
    wiccersSchema?: Promise<unknown>;
};
const localPath = path.join(process.cwd(), ".local", "wiccers.json");
export const storageMode = () => process.env.DATABASE_URL ? "database" : "local";
export function newId() { return randomBytes(16).toString("hex"); }
export function tokenHash(value: string) { return createHash("sha256").update(value).digest("hex"); }
export class CommunityError extends Error {
    constructor(message: string, public status = 400) { super(message); }
}
export async function withCommunity<T>(operation: (state: CommunityState) => T | Promise<T>): Promise<T> {
    if (process.env.DATABASE_URL) {
        const pool = globalStore.wiccersPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
        const schema = globalStore.wiccersSchema ??= pool.query("CREATE TABLE IF NOT EXISTS wiccers_state (id INTEGER PRIMARY KEY CHECK (id = 1), data JSONB NOT NULL)");
        try {
            await schema;
        }
        catch (error) {
            globalStore.wiccersSchema = undefined;
            throw error;
        }
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("INSERT INTO wiccers_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING", [JSON.stringify(empty())]);
            const result = await client.query("SELECT data FROM wiccers_state WHERE id = 1 FOR UPDATE");
            const state: CommunityState = result.rows[0].data;
            if (!state.importedLegacy) {
                const exists = await client.query("SELECT to_regclass('public.posts') AS table_name");
                if (exists.rows[0].table_name) {
                    const legacy = await client.query("SELECT id, nickname, content, created_at, (to_jsonb(posts)->>'parent_id')::integer AS parent_id FROM public.posts ORDER BY id");
                    for (const row of legacy.rows) {
                        const key = `archive:${row.nickname}`;
                        let member = state.members.find(m => m.key === key);
                        if (!member) {
                            member = { id: newId(), name: row.nickname, key, passwordHash: "", bio: "Member of the original Wiccers archive.", color: "sage", createdAt: new Date(row.created_at).toISOString(), archived: true };
                            state.members.push(member);
                        }
                        state.posts.push({ id: `archive-${row.id}`, authorId: member.id, content: row.content, createdAt: new Date(row.created_at).toISOString(), parentId: row.parent_id ? `archive-${row.parent_id}` : null, likes: [], reposts: [] });
                    }
                }
                state.importedLegacy = true;
            }
            const value = await operation(state);
            await client.query("UPDATE wiccers_state SET data = $1 WHERE id = 1", [JSON.stringify(state)]);
            await client.query("COMMIT");
            return value;
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    if (process.env.NODE_ENV === "production")
        throw new CommunityError("Configure DATABASE_URL to enable profiles and posts on this deployment.", 503);
    // Local development only: serialized atomic writes survive server restarts.
    const task = (globalStore.wiccersQueue ?? Promise.resolve()).then(async () => {
        await fs.mkdir(path.dirname(localPath), { recursive: true });
        let state: CommunityState;
        try {
            state = JSON.parse(await fs.readFile(localPath, "utf8"));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT")
                throw error;
            state = empty();
        }
        const value = await operation(state);
        const temporary = `${localPath}.${newId()}.tmp`;
        await fs.writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
        await fs.rename(temporary, localPath);
        return value;
    });
    globalStore.wiccersQueue = task.catch(() => undefined);
    return task;
}
export function limit(state: CommunityState, key: string, max: number, duration: number) {
    const now = Date.now();
    state.limits = state.limits.filter(l => l.expires > now);
    let entry = state.limits.find(l => l.key === key);
    if (!entry) {
        entry = { key, count: 0, expires: now + duration };
        state.limits.push(entry);
    }
    if (entry.count >= max)
        return false;
    entry.count++;
    return true;
}
export function currentMember(state: CommunityState, token: string | undefined) {
    if (!token)
        return null;
    const session = state.sessions.find(s => s.hash === tokenHash(token) && s.expires > Date.now());
    return session ? state.members.find(m => m.id === session.memberId) ?? null : null;
}
export function publicMember(state: CommunityState, member: Member, viewerId?: string) {
    return { id: member.id, name: member.name, bio: member.bio, color: member.color, createdAt: member.createdAt, archived: !!member.archived,
        followers: state.follows.filter(f => f.to === member.id).length, following: state.follows.filter(f => f.from === member.id).length,
        followed: state.follows.some(f => f.from === viewerId && f.to === member.id), postCount: state.posts.filter(p => p.authorId === member.id && !p.parentId).length };
}
