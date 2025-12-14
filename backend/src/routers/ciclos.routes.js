import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearCicloEvaluacionDTO } from '../DTOS/ciclosDTO.js';
import { getCiclosEvaluacion, getCicloEvaluacionPorId, putCambiarEstadoCicloEvaluacion, postCrearCicloEvaluacion } from '../controllers/ciclos.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getCiclosEvaluacion);
router.get('/:id', autenticacionMidleware, getCicloEvaluacionPorId);
router.post('/', autenticacionMidleware, esAdmin, crearCicloEvaluacionDTO, validationDTO, postCrearCicloEvaluacion);
router.put('/:id', autenticacionMidleware, esAdmin, putCambiarEstadoCicloEvaluacion);

export default router;