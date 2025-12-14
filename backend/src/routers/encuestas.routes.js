import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearEncuestasDTO, editarEncuestasDTO } from '../DTOS/encuestasDTO.js';
import { getEncuestas, getEncuestaPorId, deleteEncuesta, postCrearEncuesta, putEditarEncuesta } from '../controllers/encuestas.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getEncuestas);
router.get('/:id', autenticacionMidleware, getEncuestaPorId);
router.post('/', autenticacionMidleware, esAdmin, crearEncuestasDTO, validationDTO, postCrearEncuesta);
router.put('/:id', autenticacionMidleware, esAdmin, editarEncuestasDTO, validationDTO, putEditarEncuesta);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteEncuesta);
export default router;