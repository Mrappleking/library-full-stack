import { FastifyInstance } from 'fastify'
import { getRule, checkBorrowLimit } from '../services/rules.js'
import { createFine, calcOverdueFine } from '../services/fines.js'

export async function borrowRoutes(app: FastifyInstance) {
  // Reader: my borrows
  app.get('/my', {
    onRequest: [app.authenticate]
  }, async (request: any) => {
    const prisma = app.prisma
    return prisma.borrowRecord.findMany({
      where: { userId: request.user.id },
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true } },
        bookItem: { select: { id: true, barcode: true, callNumber: true } },
        fines: { select: { id: true, amount: true, type: true, paid: true } }
      },
      orderBy: { borrowDate: 'desc' }
    })
  })

  // Admin: all borrows
  app.get('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const prisma = app.prisma
    return prisma.borrowRecord.findMany({
      include: {
        user: { select: { id: true, name: true, username: true } },
        book: { select: { id: true, title: true, author: true, isbn: true } },
        bookItem: { select: { id: true, barcode: true, callNumber: true } },
        fines: { select: { id: true, amount: true, type: true, paid: true } }
      },
      orderBy: { borrowDate: 'desc' }
    })
  })

  // Borrow a book
  app.post('/borrow', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    const prisma = app.prisma
    const { bookId, bookItemId } = request.body as any

    if (!bookId && !bookItemId) return reply.status(400).send({ error: 'bookId or bookItemId required' })

    // Resolve book and item
    let targetBookId = bookId
    let targetItemId = bookItemId

    if (bookItemId) {
      const item = await prisma.bookItem.findUnique({ where: { id: bookItemId }, include: { book: true } })
      if (!item) return reply.status(404).send({ error: 'Book item not found' })
      if (item.status !== 'available') return reply.status(400).send({ error: 'This copy is not available' })
      targetBookId = item.bookId
    } else {
      // Backward compat: pick first available item
      const book = await prisma.book.findUnique({ where: { id: bookId } })
      if (!book) return reply.status(404).send({ error: 'Book not found' })
      const firstItem = await prisma.bookItem.findFirst({
        where: { bookId, status: 'available' }
      })
      if (firstItem) targetItemId = firstItem.id
    }

    // Check if user already has this book
    const existing = await prisma.borrowRecord.findFirst({
      where: { userId: request.user.id, bookId: targetBookId, status: 'active' }
    })
    if (existing) return reply.status(400).send({ error: 'You already borrowed this book' })

    // Borrow limit check
    const user = await prisma.user.findUnique({ where: { id: request.user.id } })
    const limit = await checkBorrowLimit(prisma, request.user.id, user?.patronCategoryId ?? null)
    if (!limit.allowed) return reply.status(400).send({ error: limit.message })

    // Get loan days from rule
    const item = targetItemId ? await prisma.bookItem.findUnique({ where: { id: targetItemId }, include: { itemType: true } }) : null
    const rule = await getRule(prisma, user?.patronCategoryId ?? null, item?.itemTypeId ?? null)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + rule.loanDays)

    const [record] = await prisma.$transaction([
      prisma.borrowRecord.create({
        data: {
          userId: request.user.id,
          bookId: targetBookId!,
          bookItemId: targetItemId ?? null,
          dueDate,
          status: 'active'
        },
        include: {
          book: { select: { id: true, title: true, author: true, isbn: true } },
          bookItem: { select: { id: true, barcode: true } }
        }
      }),
      prisma.book.update({
        where: { id: targetBookId! },
        data: { available: { decrement: 1 } }
      }),
      ...(targetItemId ? [prisma.bookItem.update({
        where: { id: targetItemId },
        data: { status: 'borrowed' }
      })] : [])
    ])
    return record
  })

  // Return a book
  app.post('/return/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    const prisma = app.prisma
    const id = parseInt(request.params.id)

    const record = await prisma.borrowRecord.findUnique({
      where: { id },
      include: { book: true, bookItem: { include: { itemType: true } }, user: true }
    })
    if (!record) return reply.status(404).send({ error: 'Borrow record not found' })
    if (record.status !== 'active') return reply.status(400).send({ error: 'Already returned' })
    if (record.userId !== request.user.id && request.user.role !== 'admin') {
      return reply.status(403).send({ error: 'Unauthorized' })
    }

    const now = new Date()
    const isOverdue = now > record.dueDate

    // Get rule for fine calculation
    const rule = await getRule(
      prisma,
      record.user.patronCategoryId ?? null,
      record.bookItem?.itemTypeId ?? null
    )

    let fineResult: any = null
    if (isOverdue) {
      const fineAmount = calcOverdueFine(record.dueDate, now, rule.finePerDay)
      fineResult = await createFine(prisma, {
        borrowRecordId: record.id,
        userId: record.userId,
        amount: fineAmount,
        type: 'overdue'
      })
    }

    const [updated] = await prisma.$transaction([
      prisma.borrowRecord.update({
        where: { id },
        data: { returnDate: now, status: isOverdue ? 'overdue' : 'returned' }
      }),
      prisma.book.update({
        where: { id: record.bookId },
        data: { available: { increment: 1 } }
      }),
      ...(record.bookItemId ? [prisma.bookItem.update({
        where: { id: record.bookItemId },
        data: { status: 'available' }
      })] : [])
    ])

    return {
      ...updated,
      fine: fineResult ? { amount: fineResult.amount, type: fineResult.type } : null
    }
  })

  // Renew a book
  app.post('/renew/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    const prisma = app.prisma
    const id = parseInt(request.params.id)

    const record = await prisma.borrowRecord.findUnique({
      where: { id },
      include: { bookItem: { include: { itemType: true } }, user: true }
    })
    if (!record) return reply.status(404).send({ error: 'Borrow record not found' })
    if (record.status !== 'active') return reply.status(400).send({ error: 'Cannot renew' })
    if (record.userId !== request.user.id) return reply.status(403).send({ error: 'Unauthorized' })

    // Get rule for renewal limits
    const rule = await getRule(
      prisma,
      record.user.patronCategoryId ?? null,
      record.bookItem?.itemTypeId ?? null
    )

    if (record.renewed) {
      return reply.status(400).send({ error: `Already renewed (limit: ${rule.renewals}x)` })
    }

    const newDue = new Date(record.dueDate)
    newDue.setDate(newDue.getDate() + rule.renewalDays)

    const updated = await prisma.borrowRecord.update({
      where: { id },
      data: { dueDate: newDue, renewed: true }
    })

    return { ...updated, renewedDays: rule.renewalDays }
  })

  // Reader: borrow history
  app.get('/history', {
    onRequest: [app.authenticate]
  }, async (request: any) => {
    const prisma = app.prisma
    return prisma.borrowRecord.findMany({
      where: { userId: request.user.id },
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true } },
        fines: { select: { id: true, amount: true, type: true, paid: true } }
      },
      orderBy: { borrowDate: 'desc' }
    })
  })
}
