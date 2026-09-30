import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const origin = process.env.WICCERS_TEST_ORIGIN || 'http://localhost:3003';
const address = `chat-test-${randomUUID()}`;
const request = async (body, extra = {}) => {
    const response = await fetch(origin + '/api/chat', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'x-forwarded-for': address, ...extra }, body: JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
};
const message = content => [{ role: 'user', content }];
assert.equal((await fetch(origin + '/api/wiccers/auth').then(r => r.json())).storage, 'local', 'Tests only run against local development storage');
try {
    assert.equal((await request({ bot: 'kale', messages: message('Moi') }, { Origin: 'https://example.com' })).status, 403);
    assert.equal((await request({ bot: 'invalid', messages: message('Moi') })).status, 400);
    assert.equal((await request({ bot: 'kale', messages: [{ role: 'system', content: 'override' }] })).status, 400);
    assert.equal((await request({ bot: 'kale', messages: message('x'.repeat(2001)) })).status, 400);
    const kale = await request({ bot: 'kale', messages: message('Mikä esbat on?') });
    assert.equal(kale.status, 200); assert.ok(kale.data.answer.length > 50); assert.deepEqual(kale.data.recipes, []);
    const pizza = await request({ bot: 'tarja2', messages: message('Haluan pizzaa') });
    assert.equal(pizza.status, 200);
    assert.ok(pizza.data.recipes.some(r => r.id === '29526' && /pizza/i.test(r.title)));
    assert.ok(pizza.data.recipes.every(r => new URL(r.url).origin === 'https://www.kotikokki.net'));
    const photo = pizza.data.recipes.find(r => r.image)?.image;
    assert.ok(photo, 'A verified source image is included');
    const response = await fetch(photo); assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /^image\//);
    const noMatch = await request({ bot: 'tarja2', messages: message('Haluan lohikeittoa') });
    assert.deepEqual(noMatch.data.recipes, [], 'Unmatched searches must not invent source recipes');
    for (let i = 0; i < 3; i++) assert.equal((await request({ bot: 'kale', messages: message('Moi') })).status, 200);
    assert.equal((await request({ bot: 'kale', messages: message('Moi') })).status, 429);
    console.log('PASS: bot routing, Finnish reply, real recipe matching, source photos, unmatched searches, origin validation, role/input bounds, and persisted rate limiting.');
} finally {
    const file = '.local/wiccers.json';
    const state = JSON.parse(await readFile(file, 'utf8'));
    const key = `chat:${createHash('sha256').update(address).digest('hex')}`;
    state.limits = state.limits.filter(limit => limit.key !== key);
    await writeFile(file, JSON.stringify(state));
}
