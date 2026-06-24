import { PrismaClient } from '@prisma/client'
import type { StatsOverviewResponse, PopularBook, MonthlyStat } from '../types/api.types.js'

export async function getOverview(prisma: PrismaClient): Promise<StatsOverviewResponse> {
  const [totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount] = await Promise.all([
    prisma.book.count(),
    prisma.user.count({ where: { role: 'reader' } }),
    prisma.borrowRecord.count({ where: { status: 'active' } }),
    prisma.category.count(),
    prisma.borrowRecord.count({ where: { status: 'overdue' } })
  ])
  return { totalBooks, totalReaders, activeBorrows, totalCategories, overdueCount }
}

export async function getPopularBooks(prisma: PrismaClient): Promise<PopularBook[]> {
  return prisma.book.findMany({
    include: {
      _count: { select: { borrowRecords: true } },
      category: true
    },
    orderBy: { borrowRecords: { _count: 'desc' } },
    take: 20
  }) as unknown as PopularBook[]
}

export async function getMonthlyStats(prisma: PrismaClient): Promise<MonthlyStat[]> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const records = await prisma.borrowRecord.findMany({
    where: { borrowDate: { gte: twelveMonthsAgo } },
    select: { borrowDate: true }
  })
  const monthly: Record<string, number> = {}
  for (const r of records) {
    const key = `${r.borrowDate.getFullYear()}-${String(r.borrowDate.getMonth() + 1).padStart(2, '0')}`
    monthly[key] = (monthly[key] || 0) + 1
  }
  return Object.entries(monthly).sort().map(([month, count]) => ({ month, count }))
}
