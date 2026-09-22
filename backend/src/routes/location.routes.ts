import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { locationController } from '../controllers/location.controller';
import { authenticate } from '../middleware/authenticate';
import { authenticateOptional } from '../middleware/authenticateOptional';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { idParamsSchema, statusBodySchema } from '../validators/common';
import {
  createLocationSchema,
  listLocationsQuerySchema,
  updateLocationSchema,
} from '../validators/location.schema';

const router = Router();

router.get(
  '/',
  authenticateOptional,
  validate(listLocationsQuerySchema, 'query'),
  locationController.list,
);
router.get(
  '/:id',
  authenticateOptional,
  validate(idParamsSchema, 'params'),
  locationController.getById,
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(createLocationSchema),
  locationController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(updateLocationSchema),
  locationController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  validate(statusBodySchema),
  locationController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validate(idParamsSchema, 'params'),
  locationController.remove,
);

export default router;
