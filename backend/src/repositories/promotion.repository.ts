import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const promotionRepository = {
  async findAll(
    where: Prisma.PromotionWhereInput,
    orderBy: Prisma.PromotionOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    const [items, total] = await Promise.all([
      prisma.promotion.findMany({ where, orderBy, skip, take }),
      prisma.promotion.count({ where }),
    ]);
    return { items, total };
  },
  findById(id: string) {
    return prisma.promotion.findUnique({ where: { id } });
  },
  create(data: Prisma.PromotionCreateInput) {
    return prisma.promotion.create({ data });
  },
  update(id: string, data: Prisma.PromotionUpdateInput) {
    return prisma.promotion.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.promotion.delete({ where: { id } });
  },
};
