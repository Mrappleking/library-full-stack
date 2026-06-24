import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as borrowService from '../services/borrow.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const borrowSchema = z.object({
  bookId: z.number().int().optional(),
  bookItemId: z.number().int().optional(),
}).refine(d => d.bookId || d.bookItemId, { message: 'bookId or bookItemId required' });

export async function borrowRoutes(app: FastifyInstance) {
  app.get('/my', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.getMyBorrows(app.prisma, request.user.id));

  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    borrowService.listBorrows(app.prisma));

  app.post('/borrow', { onRequest: [app.authenticate] }, async (request: any) => {
    const parsed = borrowSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return borrowService.borrow(app.prisma, request.user.id, parsed.data);
  });

  app.post('/return/:id', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.returnBook(app.prisma, parseInt(request.params.id), request.user.id, request.user.role === 'admin'));

  app.post('/renew/:id', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.renew(app.prisma, parseInt(request.params.id), request.user.id));

  app.get('/history', { onRequest: [app.authenticate] }, async (request: any) =>
    borrowService.getHistory(app.prisma, request.user.id));
}
