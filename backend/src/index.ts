import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { authRoutes } from './routes/auth.js'
import { bookRoutes } from './routes/books.js'
import { categoryRoutes } from './routes/categories.js'
import { borrowRoutes } from './routes/borrows.js'
import { readerRoutes } from './routes/readers.js'
import { statsRoutes } from './routes/stats.js'
import { finesRoutes } from './routes/fines.js'
import { rulesRoutes } from './routes/rules.js'

const prisma = new PrismaClient()
const app = Fastify({ logger: true })

// Decorate prisma
app.decorate('prisma', prisma)

// JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production'
})

// CORS
app.register(fastifyCors, {
  origin: true,
  credentials: true
})

// Auth decorator
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Unauthorized' })
  }
})

// Routes
app.register(authRoutes, { prefix: '/api/auth' })
app.register(bookRoutes, { prefix: '/api/books' })
app.register(categoryRoutes, { prefix: '/api/categories' })
app.register(borrowRoutes, { prefix: '/api/borrows' })
app.register(readerRoutes, { prefix: '/api/readers' })
app.register(statsRoutes, { prefix: '/api/stats' })
app.register(finesRoutes, { prefix: '/api/fines' })
app.register(rulesRoutes, { prefix: '/api/admin/rules' })

// Health check
app.get('/api/health', async () => ({ status: 'ok' }))

// Barcode lookup (Module F)
app.get('/api/book-items/:barcode', async (request: any, reply: any) => {
  const item = await prisma.bookItem.findUnique({ where: { barcode: request.params.barcode }, include: { book: true } })
  if (!item) return reply.status(404).send({ error: 'Item not found' })
  const currentBorrow = await prisma.borrowRecord.findFirst({ where: { bookItemId: item.id, status: 'active' } })
  return { item, currentBorrow }
})

// Start
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000')
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

export { app, prisma }
