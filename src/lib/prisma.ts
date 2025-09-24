// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // v dev režime si klient držíme na globale, nech sa nevytvára po každom hot-reloade
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;}