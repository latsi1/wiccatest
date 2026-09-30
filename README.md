# Wicca App

## Wiccers community

Open `/wiccer` for the redesigned mystical social feed. Create a profile using
only a name and password, then post whispers, reply, like, repost, bookmark,
follow other members, and edit your bio and avatar color. No email is collected.
Keep your password safe: email password recovery is unavailable.

Run `npm install` and `npm run dev` to start locally. Without `DATABASE_URL`,
development accounts and posts persist in the Git-ignored `.local/wiccers.json`.
Use one development server for this local data. Production requires a PostgreSQL
`DATABASE_URL`; local file storage is disabled in production. The new community
creates its own table and imports old posts as archived identities without
changing the original posts table. Deployment and archive import still need
verification against your configured database.

With the development server running on port 3000, run `npm run test:wiccers` for
the API integration tests. Set `WICCERS_TEST_ORIGIN` if you use another port.
Tests only run against local storage and remove their disposable test accounts.

See [PROJECT_REVIEW.md](PROJECT_REVIEW.md) for the project audit and implementation notes.

A magical web application for generating Finnish Wiccan spells and connecting with the community.

## Features

### Wicca Spell Generator

- Generate mystical Finnish Wiccan spells based on your desires
- Beautiful, magical UI with animations
- Responsive design for all devices

### Community Page (Twitter Clone)

- Share your thoughts with the Wiccan community
- Post messages with your nickname
- View a timeline of community posts
- Data stored in a Neon PostgreSQL database

### Sound Board

- Play magical sounds and music
- Adjustable volume controls

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: CSS Modules
- **Database**: Neon PostgreSQL
- **Deployment**: Vercel

## Setup

### Vercel Blob storage

The Blob SDK is installed for storing uploaded images. Locally, configure
`BLOB_STORE_ID` and `BLOB_READ_WRITE_TOKEN` in `.env.local` and restart the
development server after changing them. Keep the token server-side; never use
a `NEXT_PUBLIC_` prefix or commit it to Git.

In Vercel, connect the Blob store to this website's project and include the
Development, Preview, and Production environments as needed. Local environment
files are not deployed. With the Vercel CLI installed, `vercel link` followed by
`vercel env pull .env.local` can synchronize the connected project's settings.

Whispers and replies support one JPEG, PNG, or WebP image up to 4 MB. Use
**Add image** to preview it and optionally add a screen-reader description.
Image-only whispers are supported. The authenticated upload endpoint validates
the image, removes metadata, and resizes it to a maximum of 1800 pixels before
saving it as WebP in the public Blob store. Images are publicly accessible by
URL. Image files currently remain in Blob when their whispers are deleted;
unused uploads after a failed post also remain and can be removed in Vercel.

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your environment variables:
   ```
   # Neon PostgreSQL Database
   DATABASE_URL=your_neon_database_url
   ```

### Development

Run the development server:

```
npm run dev
```

### Production Build

Build for production:

```
npm run build
```

Start the production server:

```
npm start
```

## Deployment

This application is designed to be deployed on Vercel. Make sure to add the following environment variables to your Vercel project:

- `DATABASE_URL`: Your Neon PostgreSQL connection string

### Wicca Chat (Hugging Face Inference)

To enable the site-wide Wicca Chat bot:

1. Create a free token at https://huggingface.co/settings/tokens
2. Add the token locally or in Vercel env vars:

Local (PowerShell):

```
$env:HF_API_TOKEN="hf_...your_token_here"
```

Vercel → Project Settings → Environment Variables:

- Key: `HF_API_TOKEN`
- Value: your token value
- Environments: Development/Preview/Production

Optional: choose a different model by setting `HF_MODEL` (default: `mistralai/Mistral-7B-Instruct-v0.2`).

## Database Setup

The application automatically creates the necessary database tables on startup. The Twitter clone feature uses a `posts` table with the following schema:

```sql
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```

## License

MIT
