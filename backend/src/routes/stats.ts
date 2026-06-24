import { FastifyInstance } from 'fastify';
import * as statsService from '../services/stats.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export async function statsRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    statsService.getOverview(app.prisma));

  app.get('/popular', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    statsService.getPopularBooks(app.prisma));

  app.get('/monthly', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) =>
    statsService.getMonthlyStats(app.prisma));
}
