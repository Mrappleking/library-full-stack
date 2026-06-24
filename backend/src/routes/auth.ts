import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success)
      return reply
        .status(400)
        .send({ error: 'Validation failed', details: parsed.error.flatten() });
    try {
      return await authService.register(app.prisma, app.jwt, parsed.data);
    } catch (e: any) {
      return reply.status(e.statusCode || 500).send({ error: e.message });
    }
  });

  app.post('/login', async (request, reply) => {
    const { username, password } = request.body as any;
    try {
      return await authService.login(app.prisma, app.jwt, username, password);
    } catch (e: any) {
      return reply.status(e.statusCode || 401).send({ error: e.message });
    }
  });

  app.get('/me', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    try {
      return await authService.getMe(app.prisma, request.user.id);
    } catch (e: any) {
      return reply.status(e.statusCode || 404).send({ error: e.message });
    }
  });

  app.get('/users', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' });
    return authService.listUsers(app.prisma);
  });

  app.post('/admin/create', { onRequest: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.role !== 'admin') return reply.status(403).send({ error: 'Admin only' });
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Validation failed' });
    try {
      return await authService.createAdmin(app.prisma, parsed.data);
    } catch (e: any) {
      return reply.status(e.statusCode || 409).send({ error: e.message });
    }
  });
}
