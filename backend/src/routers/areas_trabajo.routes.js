import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearAreasTrabajoDTO, editarAreaTrabajoDTO } from '../DTOS/areas_trabajoDTO.js';
import { getAreasTrabajo, getAreadeTrabajoPorId, deleteAreaTrabajo, postCrearAreaTrabajo, putEditarAreaTrabajo } from '../controllers/areas_trabajo.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getAreasTrabajo);
router.get('/:id', autenticacionMidleware, getAreadeTrabajoPorId);
router.post('/', autenticacionMidleware, esAdmin, crearAreasTrabajoDTO, validationDTO, postCrearAreaTrabajo);
router.put('/:id', autenticacionMidleware, esAdmin, editarAreaTrabajoDTO, validationDTO, putEditarAreaTrabajo);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteAreaTrabajo);

export default router;