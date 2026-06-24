import { PrismaClient } from '@prisma/client';
import type { ReaderSummary, ReaderDetail } from '../types/api.types.js';

export async function listReaders(
  prisma: PrismaClient,
  page = 1,
  limit = 20,
): Promise<{ readers: ReaderSummary[]; total: number }> {
  const [readers, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'reader' },
      select: {
        id: true, username: true, name: true,
        phone: true, email: true, createdAt: true,
        _count: { select: { borrowRecords: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: 'reader' } }),
  ]);
  return { readers: readers as unknown as ReaderSummary[], total };
}

export async function getReaderDetail(
  prisma: PrismaClient,
  id: number,
): Promise<ReaderDetail | null> {
  return prisma.user.findFirst({
    where: { id, role: 'reader' },
    select: {
      id: true,
      username: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
      borrowRecords: {
        include: { book: { select: { id: true, title: true, author: true, isbn: true } } },
        orderBy: { borrowDate: 'desc' },
        take: 50,
      },
    },
  }) as unknown as ReaderDetail | null;
}

export async function updateReader(
  prisma: PrismaClient,
  id: number,
  data: { name?: string; phone?: string; email?: string },
) {
  const { name, phone, email } = data;
  return prisma.user.update({
    where: { id },
    data: { name, phone, email },
    select: { id: true, username: true, name: true, role: true, phone: true, email: true },
  });
}

export async function updateProfile(
  prisma: PrismaClient,
  userId: number,
  data: { name?: string; phone?: string; email?: string },
) {
  const { name, phone, email } = data;
  return prisma.user.update({
    where: { id: userId },
    data: { name, phone, email },
    select: { id: true, username: true, name: true, role: true, phone: true, email: true },
  });
}
