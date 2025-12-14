import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearTipoPreguntaDTO, editarTipoPreguntaDTO } from '../DTOS/tipo_preguntasDTO.js';
import { getTiposPreguntas, getTipoPreguntaPorId, deleteTipoPregunta, postCrearTipoPregunta, putEditarTipoPregunta } from '../controllers/tipo_preguntas.controller.js';

const router = Router();

router.get('/', autenticacionMidleware,getTiposPreguntas);
router.get('/:id', autenticacionMidleware, getTipoPreguntaPorId);
router.post('/', autenticacionMidleware, esAdmin, crearTipoPreguntaDTO, validationDTO, postCrearTipoPregunta);
router.put('/:id', autenticacionMidleware, esAdmin, editarTipoPreguntaDTO, validationDTO, putEditarTipoPregunta);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteTipoPregunta);
export default router;