import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const productRepository = {
  async findAll(
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },
  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },
  create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data });
  },
  update(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
