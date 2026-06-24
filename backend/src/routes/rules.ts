import { FastifyInstance } from 'fastify';
import * as ruleService from '../services/rule.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export async function rulesRoutes(app: FastifyInstance) {
  app.get('/', async () => ruleService.listRules(app.prisma));
  app.get('/patron-categories', async () => ruleService.listPatronCategories(app.prisma));
  app.get('/item-types', async () => ruleService.listItemTypes(app.prisma));

  app.put('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const { patronCategoryId, itemTypeId, maxBorrows, loanDays, renewals, renewalDays, finePerDay } = request.body;
    if (!patronCategoryId || !itemTypeId)
      throw Object.assign(new Error('patronCategoryId and itemTypeId required'), { statusCode: 400 });
    return ruleService.upsertRule(app.prisma, {
      patronCategoryId, itemTypeId, maxBorrows, loanDays, renewals, renewalDays, finePerDay,
    });
  });
}
