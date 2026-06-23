import { FastifyInstance } from 'fastify'

export async function statsRoutes(app: FastifyInstance) {
  // All stats endpoints require admin
  app.get('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma

    const [totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'reader' } }),
      prisma.borrowRecord.count({ where: { status: 'active' } }),
      prisma.category.count(),
      prisma.borrowRecord.count({ where: { status: 'overdue' } })
    ])

    return { totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount }
  })

  // Popular books
  app.get('/popular', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    const books = await prisma.book.findMany({
      include: {
        _count: { select: { borrowRecords: true } },
        category: true
      },
      orderBy: { borrowRecords: { _count: 'desc' } },
      take: 20
    })
    return books
  })

  // Monthly borrow stats (last 12 months)
  app.get('/monthly', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const records = await prisma.borrowRecord.findMany({
      where: { borrowDate: { gte: twelveMonthsAgo } },
      select: { borrowDate: true }
    })

    // Group by month
    const monthly: Record<string, number> = {}
    records.forEach(r => {
      const key = `${r.borrowDate.getFullYear()}-${String(r.borrowDate.getMonth() + 1).padStart(2, '0')}`
      monthly[key] = (monthly[key] || 0) + 1
    })

    return Object.entries(monthly).sort().map(([month, count]) => ({ month, count }))
  })
}
