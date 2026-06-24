import { PrismaClient, FineType } from '@prisma/client';

/**
 * 创建罚款记录并更新用户欠费总额
 */
export async function createFine(
  prisma: PrismaClient,
  params: {
    borrowRecordId: number;
    userId: number;
    amount: number;
    type: FineType;
  },
) {
  if (params.amount <= 0) return null;

  const fine = await prisma.fine.create({
    data: {
      borrowRecordId: params.borrowRecordId,
      userId: params.userId,
      amount: params.amount,
      type: params.type,
    },
  });

  await prisma.user.update({
    where: { id: params.userId },
    data: { totalFines: { increment: params.amount } },
  });

  return fine;
}

/**
 * 还书时计算逾期费：逾期天数 × 日罚金率
 */
export function calcOverdueFine(dueDate: Date, returnDate: Date, finePerDay: number): number {
  const overdueMs = returnDate.getTime() - dueDate.getTime();
  const overdueDays = Math.max(0, Math.ceil(overdueMs / (1000 * 60 * 60 * 24)));
  return Math.round(overdueDays * finePerDay * 100) / 100;
}
