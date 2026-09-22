import { Prisma, Product } from '@prisma/client';
import { productRepository } from '../repositories/product.repository';
import { categoryRepository } from '../repositories/category.repository';
import { HttpError } from '../utils/HttpError';

export interface ProductListQuery {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  sort: 'name' | 'price' | 'displayOrder' | 'createdAt';
  active?: boolean;
  categoryId?: string;
  search?: string;
}

export interface CreateProductInput {
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface UpdateProductInput {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  displayOrder?: number;
  active?: boolean;
}

export function serializeProduct(product: Product) {
  return { ...product, price: Number(product.price) };
}

export const productService = {
  async list(query: ProductListQuery, isAdminView: boolean) {
    const where: Prisma.ProductWhereInput = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (isAdminView) {
      if (query.active !== undefined) where.active = query.active;
    } else {
      where.active = true;
    }
    const orderBy = { [query.sort]: query.order } as Prisma.ProductOrderByWithRelationInput;
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await productRepository.findAll(where, orderBy, skip, query.limit);
    return { items: items.map(serializeProduct), total };
  },

  async getById(id: string, isAdminView: boolean) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    if (!isAdminView && !product.active) {
      throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    return serializeProduct(product);
  },

  async create(input: CreateProductInput) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    const product = await productRepository.create({
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      price: input.price.toFixed(2),
      imageUrl: input.imageUrl ?? null,
      displayOrder: input.displayOrder,
      active: input.active,
    });
    return serializeProduct(product);
  },

  async update(id: string, input: UpdateProductInput) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    if (input.categoryId && input.categoryId !== product.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new HttpError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
      }
    }
    const data: Prisma.ProductUncheckedUpdateInput = {};
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = input.price.toFixed(2);
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;
    if (input.active !== undefined) data.active = input.active;
    if (Object.keys(data).length === 0) {
      return serializeProduct(product);
    }
    const updated = await productRepository.update(id, data);
    return serializeProduct(updated);
  },

  async updateStatus(id: string, active: boolean) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    const updated = await productRepository.update(id, { active });
    return serializeProduct(updated);
  },

  async remove(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    return productRepository.remove(id);
  },
};
