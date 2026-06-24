import { PrismaClient } from '@prisma/client';
import type {
  CirculationRuleResponse,
  RuleUpsertParams,
  PatronCategoryResponse,
  ItemTypeResponse,
} from '../types/api.types.js';

export async function listRules(prisma: PrismaClient): Promise<CirculationRuleResponse[]> {
  return prisma.circulationRule.findMany({
    include: {
      patronCategory: { select: { id: true, name: true } },
      itemType: { select: { id: true, name: true, loanDays: true, fineRate: true } },
    },
    orderBy: { patronCategoryId: 'asc' },
  }) as unknown as CirculationRuleResponse[];
}

export async function listPatronCategories(
  prisma: PrismaClient,
): Promise<PatronCategoryResponse[]> {
  return prisma.patronCategory.findMany({ orderBy: { id: 'asc' } });
}

export async function listItemTypes(prisma: PrismaClient): Promise<ItemTypeResponse[]> {
  return prisma.itemType.findMany({ orderBy: { id: 'asc' } }) as unknown as ItemTypeResponse[];
}

export async function upsertRule(
  prisma: PrismaClient,
  data: RuleUpsertParams,
): Promise<CirculationRuleResponse> {
  return prisma.circulationRule.upsert({
    where: {
      patronCategoryId_itemTypeId: {
        patronCategoryId: data.patronCategoryId,
        itemTypeId: data.itemTypeId,
      },
    },
    update: data,
    create: data,
  }) as unknown as CirculationRuleResponse;
}
