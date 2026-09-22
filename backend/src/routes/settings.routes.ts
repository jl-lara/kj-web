import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settings.schema';

const router = Router();

router.get('/', settingsController.get);
router.patch(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateSettingsSchema),
  settingsController.update,
);

export default router;
