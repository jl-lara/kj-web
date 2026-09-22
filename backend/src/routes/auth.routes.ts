import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { loginLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { changePasswordSchema, loginSchema, updateProfileSchema } from '../validators/auth.schema';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.patch('/password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
