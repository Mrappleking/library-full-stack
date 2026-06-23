import { FastifyInstance } from 'fastify'

export async function readerRoutes(app: FastifyInstance) {
  // Admin: list all readers
  app.get('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    const readers = await prisma.user.findMany({
      where: { role: 'reader' },
      select: {
        id: true, username: true, name: true, phone: true, email: true, createdAt: true,
        _count: { select: { borrowRecords: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return readers
  })

  // Admin: get reader detail
  app.get('/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const id = parseInt(request.params.id)
    const prisma = app.prisma
    const reader = await prisma.user.findFirst({
      where: { id, role: 'reader' },
      select: {
        id: true, username: true, name: true, phone: true, email: true, createdAt: true,
        borrowRecords: {
          include: {
            book: { select: { id: true, title: true, author: true, isbn: true } }
          },
          orderBy: { borrowDate: 'desc' },
          take: 50
        }
      }
    })
    if (!reader) return reply.status(404).send({ error: 'Reader not found' })
    return reader
  })

  // Admin: update reader
  app.put('/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const id = parseInt(request.params.id)
    const prisma = app.prisma
    const { name, phone, email } = request.body as any
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { name, phone, email },
        select: { id: true, username: true, name: true, role: true, phone: true, email: true }
      })
      return user
    } catch {
      return reply.status(404).send({ error: 'Reader not found' })
    }
  })

  // Reader: update own profile
  app.put('/profile', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    const prisma = app.prisma
    const { name, phone, email } = request.body as any
    const user = await prisma.user.update({
      where: { id: request.user.id },
      data: { name, phone, email },
      select: { id: true, username: true, name: true, role: true, phone: true, email: true }
    })
    return user
  })
}
