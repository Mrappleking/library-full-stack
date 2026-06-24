import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as userService from '../services/user.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const updateReaderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export async function readerRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const { page = 1, limit = 20 } = request.query;
    return userService.listReaders(app.prisma, parseInt(page as string), parseInt(limit as string));
  });

  app.get('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const reader = await userService.getReaderDetail(app.prisma, parseInt(request.params.id));
    if (!reader) throw Object.assign(new Error('Reader not found'), { statusCode: 404 });
    return reader;
  });

  app.put('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = updateReaderSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return userService.updateReader(app.prisma, parseInt(request.params.id), parsed.data);
  });

  app.put('/profile', { onRequest: [app.authenticate] }, async (request: any) => {
    const parsed = updateReaderSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return userService.updateProfile(app.prisma, request.user.id, parsed.data);
  });
}
