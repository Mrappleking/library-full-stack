import { FastifyInstance } from 'fastify'

export async function rulesRoutes(app: FastifyInstance) {
  // Admin: list all rules
  app.get('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    return prisma.circulationRule.findMany({
      include: {
        patronCategory: { select: { id: true, name: true } },
        itemType: { select: { id: true, name: true, loanDays: true, fineRate: true } }
      },
      orderBy: { patronCategoryId: 'asc' }
    })
  })

  // Admin: list patron categories
  app.get('/patron-categories', async () => {
    const prisma = app.prisma
    return prisma.patronCategory.findMany({ orderBy: { id: 'asc' } })
  })

  // Admin: list item types
  app.get('/item-types', async () => {
    const prisma = app.prisma
    return prisma.itemType.findMany({ orderBy: { id: 'asc' } })
  })

  // Admin: create or update rule
  app.put('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    const { patronCategoryId, itemTypeId, maxBorrows, loanDays, renewals, renewalDays, finePerDay } = request.body as any

    if (!patronCategoryId || !itemTypeId) return reply.status(400).send({ error: 'patronCategoryId and itemTypeId required' })

    const rule = await prisma.circulationRule.upsert({
      where: { patronCategoryId_itemTypeId: { patronCategoryId, itemTypeId } },
      update: { maxBorrows, loanDays, renewals, renewalDays, finePerDay },
      create: { patronCategoryId, itemTypeId, maxBorrows, loanDays, renewals, renewalDays, finePerDay }
    })
    return rule
  })
}
