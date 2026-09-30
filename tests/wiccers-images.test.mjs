import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { del } from '@vercel/blob';

const origin = process.env.WICCERS_TEST_ORIGIN || 'http://localhost:3003';
const suffix = randomUUID().slice(0, 8), ids = [];
const request = async (endpoint, body, cookie) => {
    const response = await fetch(origin + endpoint, { method: body ? 'POST' : 'GET', headers: { Origin: origin, 'Content-Type': 'application/json', 'x-forwarded-for': `image-test-${suffix}`, ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
};
const upload = async (body, cookie, type = 'image/png', headers = {}) => {
    const response = await fetch(origin + '/api/wiccers/upload', { method: 'POST', headers: { Origin: origin, 'Content-Type': type, ...(cookie ? { Cookie: cookie } : {}), ...headers }, body });
    return { status: response.status, data: await response.json() };
};
try {
    assert.equal((await request('/api/wiccers/auth')).data.storage, 'local');
    const first = await request('/api/wiccers/auth', { action: 'register', name: `qa_img_${suffix}`, password: randomUUID() });
    assert.equal(first.status, 200); ids.push(first.data.user.id);
    const second = await request('/api/wiccers/auth', { action: 'register', name: `qa_img2_${suffix}`, password: randomUUID() });
    assert.equal(second.status, 200); ids.push(second.data.user.id);
    const bytes = await sharp({ create: { width: 2200, height: 1200, channels: 3, background: '#8c65b0' } }).png().toBuffer();
    assert.equal((await upload(bytes)).status, 401);
    assert.equal((await upload(bytes, first.cookie, 'image/png', { Origin: 'https://example.com' })).status, 403);
    assert.equal((await upload('not-an-image', first.cookie)).status, 400);
    assert.equal((await upload(bytes, first.cookie, 'image/svg+xml')).status, 415);
    assert.equal((await upload(Buffer.alloc(4 * 1024 * 1024 + 1), first.cookie)).status, 413);
    const image = await upload(bytes, first.cookie);
    assert.equal(image.status, 201, JSON.stringify(image.data));
    assert.equal((await request('/api/wiccers', { action: 'post', imageId: image.data.imageId }, second.cookie)).status, 400);
    const post = await request('/api/wiccers', { action: 'post', imageId: image.data.imageId, imageAlt: 'A violet test image' }, first.cookie);
    assert.equal(post.status, 201);
    assert.equal((await request('/api/wiccers', { action: 'post', imageId: image.data.imageId }, first.cookie)).status, 400);
    const feed = await request(`/api/wiccers?profile=${first.data.user.id}`);
    const stored = feed.data.posts.find(p => p.id === post.data.id);
    assert.equal(stored.content, ''); assert.equal(stored.image.alt, 'A violet test image');
    assert.equal(stored.image.width, 1800); assert.ok(stored.image.height < 1800);
    const fetched = await fetch(stored.image.url);
    assert.equal(fetched.status, 200); assert.equal(fetched.headers.get('content-type'), 'image/webp');
    assert.equal((await sharp(Buffer.from(await fetched.arrayBuffer())).metadata()).format, 'webp');
    const replyImage = await upload(bytes, second.cookie);
    assert.equal(replyImage.status, 201);
    const reply = await request('/api/wiccers', { action: 'post', parentId: post.data.id, imageId: replyImage.data.imageId }, second.cookie);
    assert.equal(reply.status, 201);
    assert.ok((await request(`/api/wiccers?thread=${post.data.id}`)).data.posts.find(p => p.id === reply.data.id).image);
    console.log('PASS: real Blob uploads, auth, origins, invalid types, corrupt files, size limit, attachment ownership, single use, image-only whispers/replies, resizing, and public WebP retrieval.');
} finally {
    const file = '.local/wiccers.json';
    const state = JSON.parse(await readFile(file, 'utf8'));
    const uploads = (state.uploads ?? []).filter(u => ids.includes(u.memberId));
    for (const image of uploads) await del(image.url);
    state.uploads = (state.uploads ?? []).filter(u => !ids.includes(u.memberId));
    state.members = state.members.filter(m => !ids.includes(m.id));
    state.posts = state.posts.filter(p => !ids.includes(p.authorId));
    state.sessions = state.sessions.filter(s => !ids.includes(s.memberId));
    state.limits = state.limits.filter(l => !ids.some(id => l.key.includes(id)));
    await writeFile(file, JSON.stringify(state));
}
