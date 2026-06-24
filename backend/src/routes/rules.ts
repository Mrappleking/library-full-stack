import { FastifyInstance } from 'fastify';
import * as ruleService from '../services/rule.service.js';

export async function rulesRoutes(app: FastifyInstance) {
  app.get('/', async () => ruleService.listRules(app.prisma));
  app.get('/patron-categories', async () => ruleService.listPatronCategories(app.prisma));
  app.get('/item-types', async () => ruleService.listItemTypes(app.prisma));

  app.put('/', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' });
    const {
      patronCategoryId,
      itemTypeId,
      maxBorrows,
      loanDays,
      renewals,
      renewalDays,
      finePerDay,
    } = request.body;
    if (!patronCategoryId || !itemTypeId)
      return reply.status(400).send({ error: 'patronCategoryId and itemTypeId required' });
    return ruleService.upsertRule(app.prisma, {
      patronCategoryId,
      itemTypeId,
      maxBorrows,
      loanDays,
      renewals,
      renewalDays,
      finePerDay,
    });
  });
}
