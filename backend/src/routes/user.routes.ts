import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { idParamsSchema, paginationSchema, statusBodySchema } from '../validators/common';
import { createUserSchema, updateUserSchema } from '../validators/user.schema';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/', validate(paginationSchema, 'query'), userController.list);
router.get('/:id', validate(idParamsSchema, 'params'), userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.patch(
  '/:id',
  validate(idParamsSchema, 'params'),
  validate(updateUserSchema),
  userController.update,
);
router.patch(
  '/:id/status',
  validate(idParamsSchema, 'params'),
  validate(statusBodySchema),
  userController.updateStatus,
);

export default router;
