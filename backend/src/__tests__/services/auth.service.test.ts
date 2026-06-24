import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import * as authService from '../../services/auth.service.js';

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));

function mockPrisma(overrides: Record<string, any> = {}) {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    ...overrides,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bcrypt.hash).mockResolvedValue('hashed_pw');
  vi.mocked(bcrypt.compare).mockResolvedValue(true);
});

describe('register', () => {
  it('1. 正常注册 — 返回 user+token', async () => {
    const prisma = mockPrisma();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 1, username: 'test', name: 'Test', role: 'reader' });
    const jwt = { sign: vi.fn().mockReturnValue('token_abc') };

    const result = await authService.register(prisma, jwt, {
      username: 'test',
      password: 'pw',
      name: 'Test',
    });
    expect(result.user.username).toBe('test');
    expect(result.token).toBe('token_abc');
  });

  it('2. 用户名重复 — 409', async () => {
    const prisma = mockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 99, username: 'test' });
    const jwt = { sign: vi.fn() };

    await expect(
      authService.register(prisma, jwt, { username: 'test', password: 'pw', name: 'Test' }),
    ).rejects.toThrow('already exists');
  });
});

describe('login', () => {
  it('3. 正确密码 — 200', async () => {
    const prisma = mockPrisma();
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'test',
      password: 'hash',
      name: 'T',
      role: 'reader',
      createdAt: new Date(),
    });
    const jwt = { sign: vi.fn().mockReturnValue('token_xyz') };

    const result = await authService.login(prisma, jwt, 'test', 'pw');
    expect(result.user.username).toBe('test');
    expect(result.token).toBe('token_xyz');
  });

  it('4. 错误密码 — 401', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false);
    const prisma = mockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'test', password: 'hash' });
    const jwt = { sign: vi.fn() };

    await expect(authService.login(prisma, jwt, 'test', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });
});

describe('getMe', () => {
  it('5. 有效用户 — 返回信息', async () => {
    const prisma = mockPrisma();
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'test',
      name: 'T',
      role: 'reader',
      createdAt: new Date().toISOString(),
    });

    const result = await authService.getMe(prisma, 1);
    expect(result.username).toBe('test');
  });

  it('6. 不存在 — 404', async () => {
    const prisma = mockPrisma();
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.getMe(prisma, 999)).rejects.toThrow('not found');
  });
});
