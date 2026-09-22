import rateLimit from 'express-rate-limit';
import { fail } from '../utils/apiResponse';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: fail('Too many requests', 'RATE_LIMIT_EXCEEDED'),
});
