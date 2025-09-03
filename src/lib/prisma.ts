// ak chceš edge runtime, použi '@prisma/client/edge' + accelerate extension.
// na začiatok stačí klasický klient (node runtime):
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
