import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { promotionController } from '../controllers/promotion.controller';
import { authenticate } from '../middleware/authenticate';
import { authenticateOptional } from '../middleware/authenticateOptional';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { idParamsSchema, statusBodySchema } from '../validators/common';
import {
  createPromotionSchema,
  listPromotionsQuerySchema,
  updatePromotionSchema,
} from '../validators/promotion.schema';

const router = Router();

router.get(
  '/',
  authenticateOptional,
  validate(listPromotionsQuerySchema, 'query'),
  promotionController.list,
);
router.get(
  '/:id',
  authenticateOptional,
  validate(idParamsSchema, 'params'),
  promotionController.getById,
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(createPromotionSchema),
  promotionController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(updatePromotionSchema),
  promotionController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(statusBodySchema),
  promotionController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  promotionController.remove,
);

export default router;
