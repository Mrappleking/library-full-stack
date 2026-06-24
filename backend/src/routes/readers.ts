import { FastifyInstance } from 'fastify';
import * as userService from '../services/user.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export async function readerRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    userService.listReaders(app.prisma));

  app.get('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const reader = await userService.getReaderDetail(app.prisma, parseInt(request.params.id));
    if (!reader) throw Object.assign(new Error('Reader not found'), { statusCode: 404 });
    return reader;
  });

  app.put('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    userService.updateReader(app.prisma, parseInt(request.params.id), request.body));

  app.put('/profile', { onRequest: [app.authenticate] }, async (request: any) =>
    userService.updateProfile(app.prisma, request.user.id, request.body));
}
