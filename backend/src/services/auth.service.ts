import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { RegisterParams, LoginResponse, UserProfile } from '../types/api.types.js';

export async function register(
  prisma: PrismaClient,
  jwt: any,
  data: RegisterParams,
): Promise<LoginResponse> {
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw Object.assign(new Error('Username already exists'), { statusCode: 409 });
  const hashed = await bcrypt.hash(data.password, 10);
  const user = (await prisma.user.create({
    data: {
      username: data.username,
      password: hashed,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: 'reader',
    },
    select: { id: true, username: true, name: true, role: true },
  })) as unknown as UserProfile;
  const token = jwt.sign({ id: user.id, role: user.role });
  return { user, token };
}

export async function login(
  prisma: PrismaClient,
  jwt: any,
  username: string,
  password: string,
): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  const profile: UserProfile = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
  const token = jwt.sign({ id: profile.id, role: profile.role });
  return { user: profile, token };
}

export async function getMe(prisma: PrismaClient, userId: number): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user as unknown as UserProfile;
}

export async function listUsers(prisma: PrismaClient): Promise<UserProfile[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  }) as unknown as UserProfile[];
}

export async function createAdmin(
  prisma: PrismaClient,
  data: RegisterParams,
): Promise<UserProfile> {
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw Object.assign(new Error('Username exists'), { statusCode: 409 });
  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      username: data.username,
      password: hashed,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: 'admin',
    },
    select: { id: true, username: true, name: true, role: true },
  }) as unknown as UserProfile;
}
