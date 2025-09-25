# Wicca App

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
