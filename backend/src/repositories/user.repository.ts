import { UserRole } from '@prisma/client';
import prisma from '../config/prisma';

export interface UserCreateData {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  active?: boolean;
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.count(),
    ]);
    return { items, total };
  },
  create(data: UserCreateData) {
    return prisma.user.create({ data });
  },
  update(id: string, data: UserUpdateData) {
    return prisma.user.update({ where: { id }, data });
  },
  countActiveAdminsExcept(id: string) {
    return prisma.user.count({
      where: { role: 'ADMIN', active: true, id: { not: id } },
    });
  },
};
