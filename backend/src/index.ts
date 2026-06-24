import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.js';
import { bookRoutes } from './routes/books.js';
import { categoryRoutes } from './routes/categories.js';
import { borrowRoutes } from './routes/borrows.js';
import { readerRoutes } from './routes/readers.js';
import { statsRoutes } from './routes/stats.js';
import { finesRoutes } from './routes/fines.js';
import { rulesRoutes } from './routes/rules.js';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Decorate prisma
app.decorate('prisma', prisma);

// JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
});

// CORS — whitelist local development origins
app.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    // Allow same-origin (null origin) and whitelisted origins
    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
});

// Helmet — security headers
app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Vite HMR needs inline scripts
});

// Rate limiting — 100 requests/min per IP
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Auth decorator
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(bookRoutes, { prefix: '/api/books' });
app.register(categoryRoutes, { prefix: '/api/categories' });
app.register(borrowRoutes, { prefix: '/api/borrows' });
app.register(readerRoutes, { prefix: '/api/readers' });
app.register(statsRoutes, { prefix: '/api/stats' });
app.register(finesRoutes, { prefix: '/api/fines' });
app.register(rulesRoutes, { prefix: '/api/admin/rules' });

// Health check
app.get('/api/health', async () => ({ status: 'ok' }));

// Barcode lookup (Module F)
app.get('/api/book-items/:barcode', async (request: any, reply: any) => {
  const item = await prisma.bookItem.findUnique({
    where: { barcode: request.params.barcode },
    include: { book: true },
  });
  if (!item) return reply.status(404).send({ error: 'Item not found' });
  const currentBorrow = await prisma.borrowRecord.findFirst({
    where: { bookItemId: item.id, status: 'active' },
  });
  return { item, currentBorrow };
});

// Start
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export { app, prisma };
