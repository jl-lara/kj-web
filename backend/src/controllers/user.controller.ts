import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, okList } from '../utils/apiResponse';
import {
  CreateUserInput,
  UpdateUserInput,
  userService,
} from '../services/user.service';

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { items, total } = await userService.list(page, limit);
    res.status(200).json(okList(items, { page, limit, total }));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.getById(id);
    res.status(200).json(ok(user));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateUserInput;
    const user = await userService.create(input);
    res.status(201).json(ok(user));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateUserInput;
    const user = await userService.update(id, input);
    res.status(200).json(ok(user));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { active } = req.body as { active: boolean };
    const user = await userService.updateStatus(id, active);
    res.status(200).json(ok(user));
  }),
};
