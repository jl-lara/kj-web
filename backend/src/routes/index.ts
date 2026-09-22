import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import galleryRoutes from './gallery.routes';
import healthRoutes from './health.routes';
import locationRoutes from './location.routes';
import productRoutes from './product.routes';
import promotionRoutes from './promotion.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/locations', locationRoutes);
router.use('/promotions', promotionRoutes);
router.use('/gallery', galleryRoutes);

export default router;
