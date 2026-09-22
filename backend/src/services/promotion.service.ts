import { Prisma } from '@prisma/client';
import { promotionRepository } from '../repositories/promotion.repository';
import { HttpError } from '../utils/HttpError';

export interface PromotionListQuery {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  sort: 'title' | 'startsAt' | 'createdAt';
  active?: boolean;
}

export interface CreatePromotionInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active: boolean;
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

export const promotionService = {
  async list(query: PromotionListQuery, isAdminView: boolean) {
    const where: Prisma.PromotionWhereInput = {};
    if (isAdminView) {
      if (query.active !== undefined) where.active = query.active;
    } else {
      const now = new Date();
      where.active = true;
      where.AND = [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ];
    }
    const orderBy = { [query.sort]: query.order } as Prisma.PromotionOrderByWithRelationInput;
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await promotionRepository.findAll(where, orderBy, skip, query.limit);
    return { items, total };
  },

  async getById(id: string, isAdminView: boolean) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new HttpError(404, 'Promotion not found', 'PROMOTION_NOT_FOUND');
    }
    if (!isAdminView && !promotion.active) {
      throw new HttpError(404, 'Promotion not found', 'PROMOTION_NOT_FOUND');
    }
    return promotion;
  },

  async create(input: CreatePromotionInput) {
    return promotionRepository.create({
      title: input.title,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      active: input.active,
    });
  },

  async update(id: string, input: UpdatePromotionInput) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new HttpError(404, 'Promotion not found', 'PROMOTION_NOT_FOUND');
    }
    const data: Prisma.PromotionUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.startsAt !== undefined) data.startsAt = input.startsAt;
    if (input.endsAt !== undefined) data.endsAt = input.endsAt;
    if (input.active !== undefined) data.active = input.active;
    if (Object.keys(data).length === 0) {
      return promotion;
    }
    return promotionRepository.update(id, data);
  },

  async updateStatus(id: string, active: boolean) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new HttpError(404, 'Promotion not found', 'PROMOTION_NOT_FOUND');
    }
    return promotionRepository.update(id, { active });
  },

  async remove(id: string) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new HttpError(404, 'Promotion not found', 'PROMOTION_NOT_FOUND');
    }
    return promotionRepository.remove(id);
  },
};
