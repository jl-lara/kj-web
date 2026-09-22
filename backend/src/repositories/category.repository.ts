import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const categoryRepository = {
  async findAll(
    where: Prisma.CategoryWhereInput,
    orderBy: Prisma.CategoryOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    const [items, total] = await Promise.all([
      prisma.category.findMany({ where, orderBy, skip, take }),
      prisma.category.count({ where }),
    ]);
    return { items, total };
  },
  findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },
  create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  },
  update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.category.delete({ where: { id } });
  },
  countProducts(categoryId: string) {
    return prisma.product.count({ where: { categoryId } });
  },
};
