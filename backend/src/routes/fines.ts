import { FastifyInstance } from 'fastify'

export async function finesRoutes(app: FastifyInstance) {
  // Admin: all fines
  app.get('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    const query = request.query as any
    const type = query.type || undefined
    const paid = query.paid !== undefined ? query.paid === 'true' : undefined

    const where: any = {}
    if (type) where.type = type
    if (paid !== undefined) where.paid = paid

    return prisma.fine.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, name: true } },
        borrowRecord: { select: { id: true, book: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  })

  // Reader: my fines
  app.get('/my', {
    onRequest: [app.authenticate]
  }, async (request: any) => {
    const prisma = app.prisma
    return prisma.fine.findMany({
      where: { userId: request.user.id },
      include: {
        borrowRecord: { select: { id: true, book: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })
  })

  // Admin: mark fine as paid
  app.post('/:id/pay', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    const id = parseInt(request.params.id)

    const fine = await prisma.fine.findUnique({ where: { id } })
    if (!fine) return reply.status(404).send({ error: 'Fine not found' })
    if (fine.paid) return reply.status(400).send({ error: 'Already paid' })

    const updated = await prisma.fine.update({
      where: { id },
      data: { paid: true, paidAt: new Date() }
    })

    // Deduct from user's totalFines
    await prisma.user.update({
      where: { id: fine.userId },
      data: { totalFines: { decrement: fine.amount } }
    })

    return updated
  })
}
