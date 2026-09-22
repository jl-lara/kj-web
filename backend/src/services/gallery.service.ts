import { Prisma } from '@prisma/client';
import { galleryRepository } from '../repositories/gallery.repository';
import { HttpError } from '../utils/HttpError';

export interface GalleryListQuery {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  sort: 'title' | 'displayOrder' | 'createdAt';
  active?: boolean;
}

export interface CreateGalleryInput {
  imageUrl: string;
  title?: string | null;
  altText?: string | null;
  displayOrder: number;
  active: boolean;
}

export type UpdateGalleryInput = Partial<CreateGalleryInput>;

export const galleryService = {
  async list(query: GalleryListQuery, isAdminView: boolean) {
    const where: Prisma.GalleryWhereInput = {};
    if (isAdminView) {
      if (query.active !== undefined) where.active = query.active;
    } else {
      where.active = true;
    }
    const orderBy = { [query.sort]: query.order } as Prisma.GalleryOrderByWithRelationInput;
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await galleryRepository.findAll(where, orderBy, skip, query.limit);
    return { items, total };
  },

  async getById(id: string, isAdminView: boolean) {
    const item = await galleryRepository.findById(id);
    if (!item) {
      throw new HttpError(404, 'Gallery item not found', 'GALLERY_NOT_FOUND');
    }
    if (!isAdminView && !item.active) {
      throw new HttpError(404, 'Gallery item not found', 'GALLERY_NOT_FOUND');
    }
    return item;
  },

  async create(input: CreateGalleryInput) {
    return galleryRepository.create({
      imageUrl: input.imageUrl,
      title: input.title ?? null,
      altText: input.altText ?? null,
      displayOrder: input.displayOrder,
      active: input.active,
    });
  },

  async update(id: string, input: UpdateGalleryInput) {
    const item = await galleryRepository.findById(id);
    if (!item) {
      throw new HttpError(404, 'Gallery item not found', 'GALLERY_NOT_FOUND');
    }
    const data: Prisma.GalleryUpdateInput = {};
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.title !== undefined) data.title = input.title;
    if (input.altText !== undefined) data.altText = input.altText;
    if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;
    if (input.active !== undefined) data.active = input.active;
    if (Object.keys(data).length === 0) {
      return item;
    }
    return galleryRepository.update(id, data);
  },

  async updateStatus(id: string, active: boolean) {
    const item = await galleryRepository.findById(id);
    if (!item) {
      throw new HttpError(404, 'Gallery item not found', 'GALLERY_NOT_FOUND');
    }
    return galleryRepository.update(id, { active });
  },

  async remove(id: string) {
    const item = await galleryRepository.findById(id);
    if (!item) {
      throw new HttpError(404, 'Gallery item not found', 'GALLERY_NOT_FOUND');
    }
    return galleryRepository.remove(id);
  },
};
