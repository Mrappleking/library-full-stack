import { FastifyInstance } from 'fastify';
import * as fineService from '../services/fine.service.js';

export async function finesRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' });
    const { type, paid } = request.query;
    return fineService.listFines(app.prisma, {
      type,
      paid: paid !== undefined ? paid === 'true' : undefined,
    });
  });

  app.get('/my', { onRequest: [app.authenticate] }, async (request: any) => {
    return fineService.getMyFines(app.prisma, request.user.id);
  });

  app.post('/:id/pay', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' });
    try {
      return await fineService.payFine(app.prisma, parseInt(request.params.id));
    } catch (e: any) {
      return reply.status(e.statusCode || 500).send({ error: e.message });
    }
  });
}
