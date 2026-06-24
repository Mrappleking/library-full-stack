import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as ruleService from '../services/rule.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const ruleSchema = z.object({
  patronCategoryId: z.number().int(),
  itemTypeId: z.number().int(),
  maxBorrows: z.number().int().min(1).max(100).optional(),
  loanDays: z.number().int().min(1).max(365).optional(),
  renewals: z.number().int().min(0).max(10).optional(),
  renewalDays: z.number().int().min(1).max(90).optional(),
  finePerDay: z.number().min(0).optional(),
});

export async function rulesRoutes(app: FastifyInstance) {
  app.get('/', async () => ruleService.listRules(app.prisma));
  app.get('/patron-categories', async () => ruleService.listPatronCategories(app.prisma));
  app.get('/item-types', async () => ruleService.listItemTypes(app.prisma));

  app.put('/', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = ruleSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return ruleService.upsertRule(app.prisma, parsed.data);
  });
}
