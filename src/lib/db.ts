import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";

export async function ensureSchema() {
  // pozri sa, či stĺpec photos je JSONB; ak nie, vytvor tabuľku
  await sql`
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

export async function saveProject(input: {
  id?: string;
  variant: string;
  pages: number;
  photos: string[];
}) {
  await ensureSchema();

  const id = input.id ?? randomUUID();
  const photos = (input.photos ?? []).map(String).filter(Boolean);

  await sql`
    INSERT INTO projects (id, variant, pages, photos)
    VALUES (${id}, ${input.variant}, ${input.pages}, ${photos as any})
    ON CONFLICT (id) DO NOTHING;
  `;

  return id;
}
