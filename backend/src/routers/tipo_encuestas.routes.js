import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearTipoEncuestaDTO, editarTipoEncuestaDTO } from '../DTOS/tipo_encuestaDTO.js';
import { getTiposEncuestas, getTipoEncuestaPorId, deleteTipoEncuesta, postCrearTipoEncuesta, putEditarTipoEncuesta } from '../controllers/tipo_encuesta.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getTiposEncuestas);
router.get('/:id', autenticacionMidleware, getTipoEncuestaPorId);
router.post('/', autenticacionMidleware, esAdmin, crearTipoEncuestaDTO, validationDTO, postCrearTipoEncuesta);
router.put('/:id', autenticacionMidleware, esAdmin, editarTipoEncuestaDTO, validationDTO, putEditarTipoEncuesta);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteTipoEncuesta);

export default router;