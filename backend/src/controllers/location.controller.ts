import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, okList } from '../utils/apiResponse';
import {
  CreateLocationInput,
  locationService,
  LocationListQuery,
  UpdateLocationInput,
} from '../services/location.service';

export const locationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as LocationListQuery;
    const isAdminView = Boolean(req.user);
    const { items, total } = await locationService.list(query, isAdminView);
    res.status(200).json(okList(items, { page: query.page, limit: query.limit, total }));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const isAdminView = Boolean(req.user);
    const location = await locationService.getById(id, isAdminView);
    res.status(200).json(ok(location));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateLocationInput;
    const location = await locationService.create(input);
    res.status(201).json(ok(location));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateLocationInput;
    const location = await locationService.update(id, input);
    res.status(200).json(ok(location));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { active } = req.body as { active: boolean };
    const location = await locationService.updateStatus(id, active);
    res.status(200).json(ok(location));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await locationService.remove(id);
    res.status(204).send();
  }),
};
