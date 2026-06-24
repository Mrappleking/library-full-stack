import { FastifyInstance } from 'fastify'
import * as statsService from '../services/stats.service.js'

export async function statsRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    return statsService.getOverview(app.prisma)
  })

  app.get('/popular', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    return statsService.getPopularBooks(app.prisma)
  })

  app.get('/monthly', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' })
    return statsService.getMonthlyStats(app.prisma)
  })
}
