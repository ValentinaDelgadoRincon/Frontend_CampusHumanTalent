import { Router } from 'express';
import { getRoles, getRolPorId } from '../controllers/roles.controller.js';

const router = Router();

router.get('/', getRoles);
router.get('/:id', getRolPorId);

export default router;