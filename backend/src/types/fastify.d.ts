// Fastify 装饰类型声明
import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: import('@prisma/client').PrismaClient
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    jwt: { sign: (payload: object) => string; verify: (token: string) => any }
  }
}
