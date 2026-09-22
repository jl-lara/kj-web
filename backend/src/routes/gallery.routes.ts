import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { galleryController } from '../controllers/gallery.controller';
import { authenticate } from '../middleware/authenticate';
import { authenticateOptional } from '../middleware/authenticateOptional';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { idParamsSchema, statusBodySchema } from '../validators/common';
import {
  createGallerySchema,
  listGalleryQuerySchema,
  updateGallerySchema,
} from '../validators/gallery.schema';

const router = Router();

router.get(
  '/',
  authenticateOptional,
  validate(listGalleryQuerySchema, 'query'),
  galleryController.list,
);
router.get(
  '/:id',
  authenticateOptional,
  validate(idParamsSchema, 'params'),
  galleryController.getById,
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(createGallerySchema),
  galleryController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(updateGallerySchema),
  galleryController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(statusBodySchema),
  galleryController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  galleryController.remove,
);

export default router;
