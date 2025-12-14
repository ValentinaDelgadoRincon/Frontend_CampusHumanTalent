import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { getCargos, getCargoPorId, deleteCargo, postCrearCargo, putEditarCargo } from '../controllers/cargos.controller.js';
import { crearCargoDTO, editarCargoDTO } from '../DTOS/cargosDTO.js';

const router = Router();

router.get('/', autenticacionMidleware, getCargos);
router.get('/:id', autenticacionMidleware, getCargoPorId);
router.post('/', autenticacionMidleware, esAdmin, crearCargoDTO, validationDTO, postCrearCargo);
router.put('/:id', autenticacionMidleware, esAdmin, editarCargoDTO, validationDTO, putEditarCargo);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteCargo);

export default router;