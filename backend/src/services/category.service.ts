import { Prisma } from '@prisma/client';
import { categoryRepository } from '../repositories/category.repository';
import { HttpError } from '../utils/HttpError';

export interface CategoryListQuery {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  sort: 'name' | 'displayOrder' | 'createdAt';
  active?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  displayOrder?: number;
  active?: boolean;
}

export const categoryService = {
  async list(query: CategoryListQuery, isAdminView: boolean) {
    const where: Prisma.CategoryWhereInput = {};
    if (isAdminView) {
      if (query.active !== undefined) where.active = query.active;
    } else {
      where.active = true;
    }
    const orderBy = { [query.sort]: query.order } as Prisma.CategoryOrderByWithRelationInput;
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await categoryRepository.findAll(where, orderBy, skip, query.limit);
    return { items, total };
  },

  async getById(id: string, isAdminView: boolean) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    if (!isAdminView && !category.active) {
      throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    return category;
  },

  async create(input: CreateCategoryInput) {
    return categoryRepository.create({
      name: input.name,
      description: input.description ?? null,
      displayOrder: input.displayOrder,
      active: input.active,
    });
  },

  async update(id: string, input: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    const data: Prisma.CategoryUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;
    if (input.active !== undefined) data.active = input.active;
    if (Object.keys(data).length === 0) {
      return category;
    }
    return categoryRepository.update(id, data);
  },

  async updateStatus(id: string, active: boolean) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    return categoryRepository.update(id, { active });
  },

  async remove(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    const productCount = await categoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new HttpError(
        409,
        'Category has products; remove or migrate them first',
        'CATEGORY_HAS_PRODUCTS',
      );
    }
    return categoryRepository.remove(id);
  },
};
