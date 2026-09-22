import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const locationRepository = {
  async findAll(
    where: Prisma.LocationWhereInput,
    orderBy: Prisma.LocationOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    const [items, total] = await Promise.all([
      prisma.location.findMany({ where, orderBy, skip, take }),
      prisma.location.count({ where }),
    ]);
    return { items, total };
  },
  findById(id: string) {
    return prisma.location.findUnique({ where: { id } });
  },
  create(data: Prisma.LocationCreateInput) {
    return prisma.location.create({ data });
  },
  update(id: string, data: Prisma.LocationUpdateInput) {
    return prisma.location.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.location.delete({ where: { id } });
  },
};
