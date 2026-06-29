import { FastifyInstance } from 'fastify'
import { lookupByBarcode } from '../services/book.service.js'

export async function bookItemRoutes(app: FastifyInstance) {
  app.get('/:barcode', async (request: any) => {
    const result = await lookupByBarcode(app.prisma, request.params.barcode)
    if (!result) throw Object.assign(new Error('Barcode not found'), { statusCode: 404 })
    return result
  })
}
