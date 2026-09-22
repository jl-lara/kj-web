import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadImage } from '../middleware/upload';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN, UserRole.EDITOR));

router.post('/image', uploadImage.single('image'), uploadController.uploadImage);
router.delete('/image', uploadController.removeImage);

export default router;
