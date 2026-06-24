import { PrismaClient } from '@prisma/client'
import type { CategoryCreateParams, CategoryUpdateParams, CategoryResponse } from '../types/api.types.js'

export async function list(prisma: PrismaClient): Promise<CategoryResponse[]> {
  return prisma.category.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' }
  })
}

export async function create(prisma: PrismaClient, data: CategoryCreateParams): Promise<CategoryResponse> {
  const category = await prisma.category.create({ data })
  return category as CategoryResponse
}

export async function update(
  prisma: PrismaClient,
  id: number,
  data: CategoryUpdateParams
): Promise<CategoryResponse> {
  const category = await prisma.category.update({ where: { id }, data })
  return category as CategoryResponse
}

export async function remove(prisma: PrismaClient, id: number): Promise<void> {
  const count = await prisma.book.count({ where: { categoryId: id } })
  if (count > 0) throw Object.assign(new Error(`Category has ${count} books`), { statusCode: 400 })
  await prisma.category.delete({ where: { id } })
}
