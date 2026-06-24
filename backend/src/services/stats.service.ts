import { PrismaClient } from '@prisma/client';
import type { StatsOverviewResponse, PopularBook, MonthlyStat } from '../types/api.types.js';

// Simple TTL cache for stats queries (60s expiry)
const cache = new Map<string, { data: unknown; expiry: number }>();

function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) return Promise.resolve(entry.data as T);
  return fn().then(data => {
    cache.set(key, { data, expiry: Date.now() + ttlMs });
    return data;
  });
}

export async function getOverview(prisma: PrismaClient): Promise<StatsOverviewResponse> {
  return cached('stats:overview', 60000, async () => {
    const [totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount] =
      await Promise.all([
        prisma.book.count(),
        prisma.user.count({ where: { role: 'reader' } }),
        prisma.borrowRecord.count({ where: { status: 'active' } }),
        prisma.category.count(),
        prisma.borrowRecord.count({ where: { status: 'overdue' } }),
      ]);
    return { totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount };
  });
}

export async function getPopularBooks(prisma: PrismaClient): Promise<PopularBook[]> {
  return cached('stats:popular', 60000, async () =>
    prisma.book.findMany({
      include: {
        _count: { select: { borrowRecords: true } },
        category: true,
      },
      orderBy: { borrowRecords: { _count: 'desc' } },
      take: 20,
    }) as unknown as PopularBook[],
  );
}

export async function getMonthlyStats(prisma: PrismaClient): Promise<MonthlyStat[]> {
  return cached('stats:monthly', 300000, async () => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const rows = await prisma.$queryRawUnsafe<{ month: string; count: bigint }[]>(
      `SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS count
       FROM borrow_records
       WHERE borrow_date >= ?
       GROUP BY month
       ORDER BY month`,
      twelveMonthsAgo,
    );

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
  });
}
