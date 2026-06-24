import { FastifyInstance } from 'fastify';
import * as borrowService from '../services/borrow.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export async function borrowRoutes(app: FastifyInstance) {
  app.get('/my', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.getMyBorrows(app.prisma, request.user.id));

  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    borrowService.listBorrows(app.prisma));

  app.post('/borrow', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.borrow(app.prisma, request.user.id, request.body));

  app.post('/return/:id', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.returnBook(app.prisma, parseInt(request.params.id), request.user.id, request.user.role === 'admin'));

  app.post('/renew/:id', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.renew(app.prisma, parseInt(request.params.id), request.user.id));

  app.get('/history', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.getHistory(app.prisma, request.user.id));
}
