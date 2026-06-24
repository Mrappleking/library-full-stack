import { PrismaClient } from '@prisma/client';
import type { StatsOverviewResponse, PopularBook, MonthlyStat } from '../types/api.types.js';

export async function getOverview(prisma: PrismaClient): Promise<StatsOverviewResponse> {
  const [totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount] =
    await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'reader' } }),
      prisma.borrowRecord.count({ where: { status: 'active' } }),
      prisma.category.count(),
      prisma.borrowRecord.count({ where: { status: 'overdue' } }),
    ]);
  return { totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount };
}

export async function getPopularBooks(prisma: PrismaClient): Promise<PopularBook[]> {
  return prisma.book.findMany({
    include: {
      _count: { select: { borrowRecords: true } },
      category: true,
    },
    orderBy: { borrowRecords: { _count: 'desc' } },
    take: 20,
  }) as unknown as PopularBook[];
}

export async function getMonthlyStats(prisma: PrismaClient): Promise<MonthlyStat[]> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // SQL GROUP BY with zero-fill for missing months
  const rows = await prisma.$queryRawUnsafe<{ month: string; count: bigint }[]>(
    `SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS count
     FROM borrow_records
     WHERE borrow_date >= ?
     GROUP BY month
     ORDER BY month`,
    twelveMonthsAgo,
  );

  // Zero-fill missing months
  const result: MonthlyStat[] = [];
  const filled = new Map(rows.map(r => [r.month, Number(r.count)]));
  const cursor = new Date(twelveMonthsAgo);
  const now = new Date();
  while (cursor <= now) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    result.push({ month: key, count: filled.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}
