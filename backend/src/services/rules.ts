import { PrismaClient } from '@prisma/client';

/**
 * 默认借阅规则（当 CirculationRule 表无匹配时使用）
 */
const DEFAULTS = {
  maxBorrows: 5,
  loanDays: 30,
  renewals: 1,
  renewalDays: 15,
  finePerDay: 0.1,
};

export interface BorrowRule {
  maxBorrows: number;
  loanDays: number;
  renewals: number;
  renewalDays: number;
  finePerDay: number;
}

/**
 * 查询借阅规则：读者类型 × 资料类型
 * 无匹配时返回默认规则（向后兼容旧数据）
 */
export async function getRule(
  prisma: PrismaClient,
  patronCategoryId: number | null,
  itemTypeId: number | null,
): Promise<BorrowRule> {
  if (!patronCategoryId || !itemTypeId) {
    return DEFAULTS;
  }

  const rule = await prisma.circulationRule.findUnique({
    where: {
      patronCategoryId_itemTypeId: { patronCategoryId, itemTypeId },
    },
  });

  if (!rule) return DEFAULTS;

  return {
    maxBorrows: rule.maxBorrows,
    loanDays: rule.loanDays,
    renewals: rule.renewals,
    renewalDays: rule.renewalDays,
    finePerDay: Number(rule.finePerDay),
  };
}

/**
 * 借书前置检查：读者是否超借阅上限
 */
export async function checkBorrowLimit(
  prisma: PrismaClient,
  userId: number,
  patronCategoryId: number | null,
): Promise<{ allowed: boolean; currentCount: number; maxBorrows: number; message?: string }> {
  const currentCount = await prisma.borrowRecord.count({
    where: { userId, status: 'active' },
  });

  if (!patronCategoryId) {
    if (currentCount >= DEFAULTS.maxBorrows) {
      return {
        allowed: false,
        currentCount,
        maxBorrows: DEFAULTS.maxBorrows,
        message: `已达到借阅上限 ${DEFAULTS.maxBorrows} 册`,
      };
    }
    return { allowed: true, currentCount, maxBorrows: DEFAULTS.maxBorrows };
  }

  const rule = await getRule(prisma, patronCategoryId, null);
  if (currentCount >= rule.maxBorrows) {
    return {
      allowed: false,
      currentCount,
      maxBorrows: rule.maxBorrows,
      message: `已达到借阅上限 ${rule.maxBorrows} 册`,
    };
  }
  return { allowed: true, currentCount, maxBorrows: rule.maxBorrows };
}
