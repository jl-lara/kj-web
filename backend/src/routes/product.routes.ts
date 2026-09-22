import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/authenticate';
import { authenticateOptional } from '../middleware/authenticateOptional';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { idParamsSchema, statusBodySchema } from '../validators/common';
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from '../validators/product.schema';

const router = Router();

router.get(
  '/',
  authenticateOptional,
  validate(listProductsQuerySchema, 'query'),
  productController.list,
);
router.get(
  '/:id',
  authenticateOptional,
  validate(idParamsSchema, 'params'),
  productController.getById,
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(createProductSchema),
  productController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(updateProductSchema),
  productController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(statusBodySchema),
  productController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(idParamsSchema, 'params'),
  productController.remove,
);

export default router;
