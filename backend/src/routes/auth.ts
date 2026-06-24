import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success)
      throw Object.assign(new Error('Validation failed'), {
        statusCode: 400,
        issues: parsed.error.flatten(),
      });
    return authService.register(app.prisma, app.jwt, parsed.data);
  });

  app.post('/login', async (request) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success)
      throw Object.assign(new Error('Validation failed'), {
        statusCode: 400,
        issues: parsed.error.flatten(),
      });
    const { username, password } = parsed.data;
    return authService.login(app.prisma, app.jwt, username, password);
  });

  app.get('/me', { onRequest: [app.authenticate] }, async (request: any) => {
    return authService.getMe(app.prisma, request.user.id);
  });

  app.get('/users', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    return authService.listUsers(app.prisma);
  });

  app.post('/admin/create', { onRequest: [app.authenticate, requireAdmin] }, async (request: any) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) throw Object.assign(new Error('Validation failed'), { statusCode: 400 });
    return authService.createAdmin(app.prisma, parsed.data);
  });
}
