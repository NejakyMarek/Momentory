// src/lib/db.ts
import { prisma } from './prisma';
import { randomUUID } from 'node:crypto';

export async function saveProject(input: {
  id?: string;
  variant: string;
  pages: number;
  photos: string[];
}) {
  const id = input.id ?? randomUUID();

  const photos = (input.photos ?? []).map(String).filter(Boolean);

  await prisma.project.upsert({
    where: { id },
    update: {
      variant: input.variant,
      pages: input.pages,
      photos,
      status: 'draft',
    },
    create: {
      id,
      variant: input.variant,
      pages: input.pages,
      photos,
      status: 'draft',
    },
  });

  return id;
}