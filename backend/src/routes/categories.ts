import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  desc: z.string().optional()
})

export async function categoryRoutes(app: FastifyInstance) {
  // List all
  app.get('/', async (request: any) => {
    const prisma = app.prisma
    const categories = await prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' }
    })
    return categories
  })

  // Create
  app.post('/', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const parsed = createSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Validation failed' })
    const prisma = app.prisma
    try {
      const category = await prisma.category.create({ data: parsed.data })
      return category
    } catch {
      return reply.status(409).send({ error: 'Category name already exists' })
    }
  })

  // Update
  app.put('/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const id = parseInt(request.params.id)
    const parsed = createSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Validation failed' })
    const prisma = app.prisma
    try {
      const category = await prisma.category.update({ where: { id }, data: parsed.data })
      return category
    } catch {
      return reply.status(404).send({ error: 'Category not found' })
    }
  })

  // Delete
  app.delete('/:id', {
    onRequest: [app.authenticate]
  }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    const id = parseInt(request.params.id)
    const prisma = app.prisma
    const count = await prisma.book.count({ where: { categoryId: id } })
    if (count > 0) return reply.status(400).send({ error: `Category has ${count} books, remove them first` })
    try {
      await prisma.category.delete({ where: { id } })
      return { success: true }
    } catch {
      return reply.status(404).send({ error: 'Category not found' })
    }
  })
}
