import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { BookItemBarcodeResponse } from '../types/api.types.js'

export async function lookupByBarcode(
  prisma: PrismaClient,
  barcode: string
): Promise<BookItemBarcodeResponse | null> {
  const item = await prisma.bookItem.findUnique({
    where: { barcode },
    include: {
      book: true,
      itemType: true,
      borrowRecords: { where: { status: 'active' }, take: 1 },
    },
  })
  if (!item) return null
  return {
    item: item as any,
    currentBorrow: (item.borrowRecords?.[0] ?? null) as any,
  }
}

export async function bookItemRoutes(app: FastifyInstance) {
  app.get('/:barcode', async (request: any) => {
    const result = await lookupByBarcode(app.prisma, request.params.barcode)
    if (!result) throw Object.assign(new Error('Barcode not found'), { statusCode: 404 })
    return result
  })
}
