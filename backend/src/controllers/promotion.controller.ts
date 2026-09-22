import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, okList } from '../utils/apiResponse';
import {
  CreatePromotionInput,
  promotionService,
  PromotionListQuery,
  UpdatePromotionInput,
} from '../services/promotion.service';

export const promotionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as PromotionListQuery;
    const isAdminView = Boolean(req.user);
    const { items, total } = await promotionService.list(query, isAdminView);
    res.status(200).json(okList(items, { page: query.page, limit: query.limit, total }));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const isAdminView = Boolean(req.user);
    const promotion = await promotionService.getById(id, isAdminView);
    res.status(200).json(ok(promotion));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreatePromotionInput;
    const promotion = await promotionService.create(input);
    res.status(201).json(ok(promotion));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const input = req.body as UpdatePromotionInput;
    const promotion = await promotionService.update(id, input);
    res.status(200).json(ok(promotion));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { active } = req.body as { active: boolean };
    const promotion = await promotionService.updateStatus(id, active);
    res.status(200).json(ok(promotion));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await promotionService.remove(id);
    res.status(204).send();
  }),
};
