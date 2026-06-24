import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as holdService from '../services/hold.service.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const holdSchema = z.object({
  bookId: z.number().int().positive(),
})

export async function holdRoutes(app: FastifyInstance) {
  // Create hold
  app.post('/', { onRequest: [app.authenticate] }, async (request: any) => {
    const parsed = holdSchema.safeParse(request.body)
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 })
    return holdService.createHold(app.prisma, request.user.id, parsed.data.bookId)
  })

  // Public: count pending holds for a book
  app.get('/count', async (request: any) => {
    const bookId = parseInt(request.query.bookId)
    if (!bookId) return { count: 0 }
    const count = await app.prisma.hold.count({
      where: { bookId, status: 'pending' },
    })
    return { count }
  })

  // Cancel own hold
  app.delete('/:id', { onRequest: [app.authenticate] }, async (request: any) =>
    holdService.cancelHold(app.prisma, parseInt(request.params.id), request.user.id))

  // My holds
  app.get('/my', { onRequest: [app.authenticate] }, async (request: any) =>
    holdService.getMyHolds(app.prisma, request.user.id))

  // Admin: list all holds
  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const { page = 1, limit = 20 } = request.query;
    return holdService.listHolds(app.prisma, request.query, parseInt(page as string), parseInt(limit as string));
  })

  // Admin: fulfill hold
  app.post('/:id/fulfill', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    holdService.fulfillHold(app.prisma, parseInt(request.params.id)))
}
