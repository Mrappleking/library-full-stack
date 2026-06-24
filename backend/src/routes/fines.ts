import { FastifyInstance } from 'fastify';
import * as fineService from '../services/fine.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export async function finesRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const { type, paid } = request.query;
    return fineService.listFines(app.prisma, {
      type,
      paid: paid !== undefined ? paid === 'true' : undefined,
    });
  });

  app.get('/my', { onRequest: [app.authenticate] }, async (request: any) =>
    fineService.getMyFines(app.prisma, request.user.id));

  app.post('/:id/pay', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    fineService.payFine(app.prisma, parseInt(request.params.id)));
}
