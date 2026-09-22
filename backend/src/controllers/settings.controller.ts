import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { settingsService } from '../services/settings.service';
import { SettingsUpdateData } from '../repositories/settings.repository';

export const settingsController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.get();
    res.status(200).json(ok(settings));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as SettingsUpdateData;
    const settings = await settingsService.update(input);
    res.status(200).json(ok(settings));
  }),
};
