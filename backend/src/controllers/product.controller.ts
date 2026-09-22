import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, okList } from '../utils/apiResponse';
import {
  CreateProductInput,
  productService,
  ProductListQuery,
  UpdateProductInput,
} from '../services/product.service';

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ProductListQuery;
    const isAdminView = Boolean(req.user);
    const { items, total } = await productService.list(query, isAdminView);
    res.status(200).json(okList(items, { page: query.page, limit: query.limit, total }));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const isAdminView = Boolean(req.user);
    const product = await productService.getById(id, isAdminView);
    res.status(200).json(ok(product));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateProductInput;
    const product = await productService.create(input);
    res.status(201).json(ok(product));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateProductInput;
    const product = await productService.update(id, input);
    res.status(200).json(ok(product));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { active } = req.body as { active: boolean };
    const product = await productService.updateStatus(id, active);
    res.status(200).json(ok(product));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await productService.remove(id);
    res.status(204).send();
  }),
};
