// src/lib/db.ts
import { createClient } from '@vercel/postgres';

const db = createClient({ connectionString: process.env.POSTGRES_URL! });
// dôležité: pripojiť sa raz pri štarte
await db.connect();

export async function ensureSchema() {
  await db.sql`
    CREATE TABLE IF NOT EXISTS projects (
      id         TEXT PRIMARY KEY,
      variant    TEXT NOT NULL,
      pages      INT  NOT NULL,
      photos     JSONB NOT NULL,
      status     TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

type SaveInput = {
  id?: string;
  variant: string;
  pages: number;
  photos: string[];
};

export async function saveProject(input: SaveInput) {
  await ensureSchema();
  const id = input.id ?? crypto.randomUUID();

  // photos uložíme ako JSONB
  await db.sql`
    INSERT INTO projects (id, variant, pages, photos)
    VALUES (${id}, ${input.variant}, ${input.pages}, ${JSON.stringify(input.photos)}::jsonb)
    ON CONFLICT (id) DO NOTHING;
  `;

  return id;
}
