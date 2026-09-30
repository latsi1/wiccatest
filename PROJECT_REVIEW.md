# Wiccoset project review and modernization

## Identity and architecture
The actual site is a Finnish personal/community playground: a Wicca journal and spell generator alongside community conversations, streamer clips, a searchable soundboard, a humor generator, a piano, and a canvas game. The old README describes only part of this. Keep the personal voice and archive, while giving visitors clear routes into each feature.

The stack is Next.js 15.2.8 App Router, React 19, TypeScript, CSS Modules, Tailwind 4, PostgreSQL through pg, and Hugging Face inference. Most pages are client components. There is no test suite. No dependency upgrade or live deployment was performed in this pass.

## Findings, in priority order
1. Critical: GET /api/wiccaposts dropped and rebuilt the posts table. GET /api/seed deleted posts before opening its transaction. Both were public. Replaced these endpoints with HTTP 410 responses; no database maintenance was executed.
2. Critical: DELETE /api/posts had no authentication. Wiccers and the duplicate Twitter page check hardcoded credentials in client JavaScript and trust localStorage. Deletion now returns HTTP 403. Proper server sessions and admin authorization remain necessary before enabling moderation; the existing client admin form does not provide real authentication.
3. High: votes accept client-provided deltas, with no identity or durable vote history. Added integer ID and bounded undo-value validation, but repeat voting remains possible. Likes can also be incremented repeatedly. Add server-backed uniqueness and a deployment-appropriate rate limiter to both features and AI requests.
4. High: AI chat accepts largely unchecked message contents, tries several external models sequentially without timeouts, and returns provider errors to clients. Add role/content/size validation, request deadlines, and generic user-facing errors. The poem and chat routes use different token variable names.
5. UX/privacy: the old checkout requested the visitor's IP and falsely claimed a payment and email delivery. Removed that flow. Removed the stale Christmas 2025 promotion and the unsupported game release promise; retained the existing game trailer.
6. Performance: public contains 245 files totaling approximately 986 MB. WiccaTube hardcodes its list of 63 video filenames and loads metadata for every preview. Prefer a generated media manifest with readable titles and poster images, pagination, and video loading on interaction. The homepage trailer now uses preload="none".
7. Maintainability: /twitter duplicates /wiccer; database pools and SSL configuration repeat across route files. Consolidate database access, add explicit migrations, paginate posts, and redirect the legacy community route after verifying existing links. Database errors currently masquerade as empty results.
8. Accessibility: the old navigation overflowed on mobile; long homepage articles were revealed character by character; the root language was English despite a Finnish default. Fixed the shared navigation and homepage, added focus indicators and a skip link, validated stored language preferences, tolerated unavailable storage, and synchronize the HTML language. Individual media modals, keyboard support, focus management, and chat translation still need review.
9. Operations: the lint script used next lint, which does not work with the installed Next version. It now runs ESLint directly. Adjusted FlatCompat plugin resolution for pnpm. The manual seed script references ts-node, which is absent from package.json; repair it before use. Git LFS is configured for media but the git-lfs executable is unavailable in this environment.

## Implemented design
Calmer mystical homepage with forest-green background, sage accents, generous spacing, serif headings, and a lightweight CSS crescent illustration. Responsive discovery cards link to existing features. Both original journal entries are preserved in src/app/data/journal.ts and expand with native details controls. Humor features and the game trailer remain accessible. Shared navigation has a collapsible mobile menu, active-page semantics, and FI/EN switching. The shared chat launcher has quieter styling.

## Validation and limits
TypeScript and ESLint checked locally. ESLint has one pre-existing next/image warning in ChatWidget.tsx. Homepage checked in the in-app browser, including mobile menu and language switching. Build verification results are reported in the chat. Live database operations, external AI replies, and production deployment are outside this validation. Existing modified video assets were left untouched.

## Recommended next work
Carry this design through the spell generator, community board, soundboard, and video library, keeping each page's existing behavior. Before public deployment, implement server-side admin sessions, durable vote records, input bounds, and rate limits. Then consolidate media metadata, generate thumbnails, and move large media to appropriate storage/CDN if needed. Verify framework and provider support/security against current official documentation before dependency upgrades.

## Wiccers redesign

The `/wiccer` page now provides a mystical three-column social feed with animated aurora lighting, drifting moon art, shooting-star trails, staggered post entrances, animated likes, profile dialogs, and glowing interactive controls. `/twitter` redirects to this page.

Working features: name/password registration, sign-in/out, profiles with bio and avatar color, 500-character posts, root conversations with replies, per-account likes and reposts, private bookmarks, follows, a following feed, text/name/hashtag search, genuine hashtag trends, and paginated feeds. Registration requires no email. Passwords use salted scrypt; random session tokens are stored as SHA-256 hashes and sent in HttpOnly/SameSite cookies. State-changing requests check their Origin, infer authorship from the session, enforce input bounds, and limit authentication and write attempts.

Local development without DATABASE_URL persists data in `.local/wiccers.json`, which is ignored by Git. This file contains password hashes and session hashes; do not publish it. Local writes are serialized within one server process and written atomically. Use one development server for this data file. Production requires DATABASE_URL and refuses the local fallback. The PostgreSQL adapter creates a dedicated `wiccers_state` table and protects updates with a transaction and row lock. On first use it copies original posts into archived identities without changing the original posts table. Archive identities cannot log in; newly registered profiles cannot claim old posts just by choosing the same name.

For this small community, one PostgreSQL JSONB document keeps local and deployed behavior consistent. All updates are serialized on that document; a larger community should migrate to indexed relational member/post/session/follow tables and dedicated pagination queries. There is no password recovery, account rename, account deletion, media upload, or notification system in this implementation. With no email collection, password loss cannot be resolved by email. Old votes are not presented as new-account likes.

Run `npm run dev`, then open `/wiccer`. For deployment set DATABASE_URL to a PostgreSQL connection string including its provider's SSL configuration. No live database was accessed during implementation. Existing users/posts on a hosted database and the import path still require validation in a preview environment.

The API integration suite is `node tests/wiccers.test.mjs` against a running local development server on port 3000 by default; set WICCERS_TEST_ORIGIN to use another port. It creates disposable profiles, tests permissions and the main social interactions, and removes only those fixture profiles afterward. It requires local storage so it cannot run against a deployed database. Production build output and development output are separated to avoid corrupting an active preview during a build.

