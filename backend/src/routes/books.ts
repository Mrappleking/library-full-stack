import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createSchema = z.object({
  isbn: z.string().min(1).max(20),
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  publisher: z.string().optional(),
  year: z.number().int().optional(),
  total: z.number().int().min(1).default(1),
  location: z.string().optional(),
  desc: z.string().optional(),
  categoryId: z.number().int()
})

export async function bookRoutes(app: FastifyInstance) {
  // List books (public, with pagination + search)
  app.get('/', async (request: any) => {
    const prisma = app.prisma
    const query = request.query as any
    const page = Math.max(1, parseInt(query.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '20')))
    const search = query.search || ''
    const categoryId = query.categoryId ? parseInt(query.categoryId) : undefined

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } }
      ]
    }
    if (categoryId) where.categoryId = categoryId

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.book.count({ where })
    ])

    return { books, total, page, limit, pages: Math.ceil(total / limit) }
  })

  // GET /api/books/:id/items — 复本列表（必须在 :id 之前注册）
  app.get('/:id/items', async (request: any, reply: any) => {
    const prisma = app.prisma
    const id = parseInt(request.params.id)
    const book = await prisma.book.findUnique({ where: { id } })
    if (!book) return reply.status(404).send({ error: 'Book not found' })

    const items = await prisma.bookItem.findMany({
      where: { bookId: id },
      include: { itemType: true, borrowRecords: { where: { status: 'active' }, take: 1 } },
      orderBy: { barcode: 'asc' }
    })
    return { book: { id: book.id, title: book.title, isbn: book.isbn }, items }
  })

  // Get single book
  app.get('/:id', async (request: any, reply: any) => {
    const prisma = app.prisma
    const id = parseInt(request.params.id)
    const book = await prisma.book.findUnique({
      where: { id },
      include: { category: true, _count: { select: { items: true } } }
    })
    if (!book) return reply.status(404).send({ error: 'Book not found' })
    return book
  })

  // Create book (admin only)
  app.post('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const parsed = createSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() })
    const { total, ...rest } = parsed.data
    const prisma = app.prisma
    const book = await prisma.book.create({
      data: { ...rest, total, available: total, status: 'available' },
      include: { category: true }
    })
    return book
  })

  // Update book (admin only)
  app.put('/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const id = parseInt(request.params.id)
    const parsed = createSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Validation failed' })
    const prisma = app.prisma
    const data: any = { ...parsed.data }
    if (data.total !== undefined) {
      const current = await prisma.book.findUnique({ where: { id } })
      if (current) {
        const borrowed = current.total - current.available
        if (data.total < borrowed) {
          return reply.status(400).send({ error: `Cannot reduce total below ${borrowed} (${borrowed} copies currently borrowed)` })
        }
        const diff = data.total - current.total
        data.available = current.available + diff
      }
    }
    try {
      const book = await prisma.book.update({ where: { id }, data, include: { category: true } })
      return book
    } catch {
      return reply.status(404).send({ error: 'Book not found' })
    }
  })

  // Delete book (admin only)
  app.delete('/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const id = parseInt(request.params.id)
    const prisma = app.prisma
    try {
      await prisma.book.delete({ where: { id } })
      return { success: true }
    } catch {
      return reply.status(404).send({ error: 'Book not found' })
    }
  })
}
