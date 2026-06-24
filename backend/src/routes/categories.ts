import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as categoryService from '../services/category.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const createSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/', async () => categoryService.list(app.prisma));

  app.post('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return categoryService.create(app.prisma, parsed.data);
  });

  app.put('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = createSchema.partial().safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return categoryService.update(app.prisma, parseInt(request.params.id), parsed.data);
  });

  app.delete('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    await categoryService.deleteCategory(app.prisma, parseInt(request.params.id));
    return { success: true };
  });
}
