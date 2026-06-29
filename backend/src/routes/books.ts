import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as bookService from '../services/book.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const createSchema = z.object({
  isbn: z.string().min(1).max(20),
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  publisher: z.string().optional(),
  year: z.number().int().optional(),
  total: z.number().int().min(1).default(1),
  location: z.string().optional(),
  desc: z.string().optional(),
  categoryId: z.number().int(),
});

export async function bookRoutes(app: FastifyInstance) {
  app.get('/', async (request: any) => {
    const q = request.query;
    return bookService.list(app.prisma, {
      page: parseInt(q.page) || 1,
      limit: parseInt(q.limit) || 20,
      search: q.search,
      categoryId: q.categoryId ? parseInt(q.categoryId) : undefined,
      campus: q.campus,
      yearMin: q.yearMin ? parseInt(q.yearMin) : undefined,
      yearMax: q.yearMax ? parseInt(q.yearMax) : undefined,
      language: q.language,
      sortBy: q.sortBy,
    });
  });

  app.get('/facets', async (request: any) => {
    const q = request.query;
    return bookService.getFacets(app.prisma, {
      search: q.search,
      categoryId: q.categoryId ? parseInt(q.categoryId) : undefined,
    });
  });

  app.get('/:id/items', async (request: any) => {
    const result = await bookService.getItems(app.prisma, parseInt(request.params.id));
    if (!result) throw Object.assign(new Error('Book not found'), { statusCode: 404 });
    return result;
  });

  app.get('/:id', async (request: any) => {
    const book = await bookService.getById(app.prisma, parseInt(request.params.id));
    if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });
    return book;
  });

  app.post('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return bookService.create(app.prisma, parsed.data);
  });

  app.put('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = createSchema.partial().safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return bookService.update(app.prisma, parseInt(request.params.id), parsed.data);
  });

  app.delete('/:id', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    await bookService.remove(app.prisma, parseInt(request.params.id));
    return { success: true };
  });

  // Admin: reconcile available count (fix drift from actual item statuses)
  app.post('/:id/reconcile', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    bookService.reconcileBookAvailable(app.prisma, parseInt(request.params.id)));
}
