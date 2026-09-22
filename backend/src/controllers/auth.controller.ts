import { Request, Response } from 'express';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookies';
import { HttpError } from '../utils/HttpError';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json(ok({ accessToken: result.accessToken, user: result.user }));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[env.refreshCookieName];
    if (!rawToken) {
      throw new HttpError(401, 'Refresh token missing', 'INVALID_REFRESH_TOKEN');
    }
    const result = await authService.refresh(rawToken);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json(ok({ accessToken: result.accessToken }));
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[env.refreshCookieName];
    await authService.logout(rawToken);
    clearRefreshCookie(res);
    res.status(200).json(ok({ message: 'Logged out' }));
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    res.status(200).json(ok(user));
  }),
};
