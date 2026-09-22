import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const galleryRepository = {
  async findAll(
    where: Prisma.GalleryWhereInput,
    orderBy: Prisma.GalleryOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    const [items, total] = await Promise.all([
      prisma.gallery.findMany({ where, orderBy, skip, take }),
      prisma.gallery.count({ where }),
    ]);
    return { items, total };
  },
  findById(id: string) {
    return prisma.gallery.findUnique({ where: { id } });
  },
  create(data: Prisma.GalleryCreateInput) {
    return prisma.gallery.create({ data });
  },
  update(id: string, data: Prisma.GalleryUpdateInput) {
    return prisma.gallery.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.gallery.delete({ where: { id } });
  },
};
