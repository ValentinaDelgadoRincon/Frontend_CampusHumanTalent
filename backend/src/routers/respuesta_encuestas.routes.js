import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearRespuestaEncuestaDTO } from '../DTOS/respuesta_encuestasDTO.js';
import { getRespuestasEncuestas, getRespuestaEncuestaPorId, getRespuestaEncuestaPorIdUsuarioEvaluado, getRespuestasPorIdUsuarioEvaluador, postCrearRespuestaEncuesta, getRespuestaEncuestaPorIdCiclo } from '../controllers/respuesta_encuestas.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, esAdmin, getRespuestasEncuestas);
router.get('/:id', autenticacionMidleware, esAdmin, getRespuestaEncuestaPorId);
router.get('/ciclo/:id', autenticacionMidleware, esAdmin, getRespuestaEncuestaPorIdCiclo);
router.get('/evaluador/:id', autenticacionMidleware, esAdmin, getRespuestasPorIdUsuarioEvaluador);
router.get('/evaluado/:id', autenticacionMidleware, esAdmin, getRespuestaEncuestaPorIdUsuarioEvaluado);
router.post('/', autenticacionMidleware, crearRespuestaEncuestaDTO, validationDTO, postCrearRespuestaEncuesta);

export default router;