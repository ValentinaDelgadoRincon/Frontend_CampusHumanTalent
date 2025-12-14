import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearPreguntasDTO, editarPreguntasDTO } from '../DTOS/preguntasDTO.js';
import { getPreguntas, getPreguntaPorId, deletePregunta, postCrearPregunta, putEditarPregunta } from '../controllers/preguntas.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getPreguntas);
router.get('/:id', autenticacionMidleware, getPreguntaPorId);
router.post('/', autenticacionMidleware, esAdmin, crearPreguntasDTO, validationDTO, postCrearPregunta);
router.put('/:id', autenticacionMidleware, esAdmin, editarPreguntasDTO, validationDTO, putEditarPregunta);
router.delete('/:id', autenticacionMidleware, esAdmin, deletePregunta);
export default router;