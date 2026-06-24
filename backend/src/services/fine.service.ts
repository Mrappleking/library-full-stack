import { PrismaClient } from '@prisma/client'
import type { FineListParams, FineResponse, FinePayResult } from '../types/api.types.js'

export async function listFines(prisma: PrismaClient, filters: FineListParams): Promise<FineResponse[]> {
  const where: any = {}
  if (filters.type) where.type = filters.type
  if (filters.paid !== undefined) where.paid = filters.paid
  return prisma.fine.findMany({
    where,
    include: {
      user: { select: { id: true, username: true, name: true } },
      borrowRecord: { select: { id: true, book: { select: { title: true } } } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  }) as unknown as FineResponse[]
}

export async function getMyFines(prisma: PrismaClient, userId: number): Promise<FineResponse[]> {
  return prisma.fine.findMany({
    where: { userId },
    include: {
      borrowRecord: { select: { id: true, book: { select: { title: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  }) as unknown as FineResponse[]
}

export async function payFine(prisma: PrismaClient, fineId: number): Promise<FinePayResult> {
  const fine = await prisma.fine.findUnique({ where: { id: fineId } })
  if (!fine) throw Object.assign(new Error('Fine not found'), { statusCode: 404 })
  if (fine.paid) throw Object.assign(new Error('Already paid'), { statusCode: 400 })
  const updated = await prisma.fine.update({ where: { id: fineId }, data: { paid: true, paidAt: new Date() } })
  await prisma.user.update({ where: { id: fine.userId }, data: { totalFines: { decrement: fine.amount } } })
  return updated as FinePayResult
}
