import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/authenticate';
import { authenticateOptional } from '../middleware/authenticateOptional';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { idParamsSchema, statusBodySchema } from '../validators/common';
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../validators/category.schema';

const router = Router();

router.get(
  '/',
  authenticateOptional,
  validate(listCategoriesQuerySchema, 'query'),
  categoryController.list,
);
router.get(
  '/:id',
  authenticateOptional,
  validate(idParamsSchema, 'params'),
  categoryController.getById,
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(createCategorySchema),
  categoryController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(statusBodySchema),
  categoryController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  categoryController.remove,
);

export default router;
