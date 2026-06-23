import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional()
})

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

export async function authRoutes(app: FastifyInstance) {
  // Register (readers only)
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() })
    }

    const { username, password, name, phone, email } = parsed.data
    const prisma = app.prisma

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return reply.status(409).send({ error: 'Username already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, password: hashed, name, phone, email, role: 'reader' },
      select: { id: true, username: true, name: true, role: true }
    })

    const token = app.jwt.sign({ id: user.id, role: user.role })
    return { user, token }
  })

  // Login
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid credentials' })
    }

    const { username, password } = parsed.data
    const prisma = app.prisma

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const token = app.jwt.sign({ id: user.id, role: user.role })
    return {
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
      token
    }
  })

  // Get current user
  app.get('/me', {
    onRequest: [app.authenticate]
  }, async (request: any) => {
    const prisma = app.prisma
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { id: true, username: true, name: true, role: true, phone: true, email: true, createdAt: true }
    })
    if (!user) {
      throw { statusCode: 404, message: 'User not found' }
    }
    return user
  })

  // Admin: list all users
  app.get('/users', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') {
      return reply.status(403).send({ error: 'Admin only' })
    }
    const prisma = app.prisma
    return prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, phone: true, email: true, createdAt: true }
    })
  })

  // Admin: create admin user
  app.post('/admin/create', {
    onRequest: [app.authenticate]
  }, async (request: any, reply) => {
    if (request.user.role !== 'admin') {
      return reply.status(403).send({ error: 'Admin only' })
    }
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed' })
    }
    const { username, password, name, phone, email } = parsed.data
    const prisma = app.prisma
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return reply.status(409).send({ error: 'Username exists' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, password: hashed, name, phone, email, role: 'admin' },
      select: { id: true, username: true, name: true, role: true }
    })
    return user
  })
}
