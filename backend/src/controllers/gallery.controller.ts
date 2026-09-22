import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, okList } from '../utils/apiResponse';
import {
  CreateGalleryInput,
  galleryService,
  GalleryListQuery,
  UpdateGalleryInput,
} from '../services/gallery.service';

export const galleryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as GalleryListQuery;
    const isAdminView = Boolean(req.user);
    const { items, total } = await galleryService.list(query, isAdminView);
    res.status(200).json(okList(items, { page: query.page, limit: query.limit, total }));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const isAdminView = Boolean(req.user);
    const item = await galleryService.getById(id, isAdminView);
    res.status(200).json(ok(item));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateGalleryInput;
    const item = await galleryService.create(input);
    res.status(201).json(ok(item));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateGalleryInput;
    const item = await galleryService.update(id, input);
    res.status(200).json(ok(item));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { active } = req.body as { active: boolean };
    const item = await galleryService.updateStatus(id, active);
    res.status(200).json(ok(item));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await galleryService.remove(id);
    res.status(204).send();
  }),
};
