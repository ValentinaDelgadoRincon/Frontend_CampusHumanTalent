import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearTipoRespuestaDTO, editarTipoRespuestaDTO } from '../DTOS/tipo_respuestaDTO.js';
import { getTiposRespuestas, getTipoRespuestaPorId, deleteTipoRespuesta, postCrearTipoRespuesta, putEditarTipoRespuesta } from '../controllers/tipo_respuestas.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getTiposRespuestas);
router.get('/:id', autenticacionMidleware, getTipoRespuestaPorId);
router.post('/', autenticacionMidleware, esAdmin, crearTipoRespuestaDTO, validationDTO, postCrearTipoRespuesta);
router.put('/:id', autenticacionMidleware, esAdmin, editarTipoRespuestaDTO, validationDTO, putEditarTipoRespuesta);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteTipoRespuesta);

export default router;