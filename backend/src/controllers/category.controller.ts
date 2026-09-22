import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, okList } from '../utils/apiResponse';
import {
  categoryService,
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../services/category.service';

export const categoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CategoryListQuery;
    const isAdminView = Boolean(req.user);
    const { items, total } = await categoryService.list(query, isAdminView);
    res.status(200).json(okList(items, { page: query.page, limit: query.limit, total }));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const isAdminView = Boolean(req.user);
    const category = await categoryService.getById(id, isAdminView);
    res.status(200).json(ok(category));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateCategoryInput;
    const category = await categoryService.create(input);
    res.status(201).json(ok(category));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateCategoryInput;
    const category = await categoryService.update(id, input);
    res.status(200).json(ok(category));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { active } = req.body as { active: boolean };
    const category = await categoryService.updateStatus(id, active);
    res.status(200).json(ok(category));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await categoryService.remove(id);
    res.status(204).send();
  }),
};
