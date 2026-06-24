import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { beforeAll, afterAll } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.test') });

const DB = process.env.DATABASE_URL;

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient({ datasources: { db: { url: DB } } });
});

afterAll(async () => {
  await prisma?.$disconnect();
});

export { prisma, DB };
