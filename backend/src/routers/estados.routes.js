import { Router } from 'express';
import { getEstados, getEstadoPorId } from '../controllers/estados.controller.js';

const router = Router();

router.get('/', getEstados);
router.get('/:id', getEstadoPorId);
export default router;