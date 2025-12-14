import { Router } from 'express';
import { validationDTO } from '../middelewares/validationDTO.js';
import { autenticacionMidleware, esAdmin } from '../middelewares/authenticationMiddeleware.js';
import { crearUsuarioDTO, editarUsuarioDTO } from '../DTOS/usuariosDTO.js';
import { getUsuarios, getUsuarioPorId, deleteUsuario, postCrearUsuario, putEditarUsuarioAdmin, putEditarUsuarioPerfil, postIniciarSesion } from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/', autenticacionMidleware, getUsuarios);
router.get('/:id', autenticacionMidleware, getUsuarioPorId);
router.post('/', autenticacionMidleware, esAdmin, crearUsuarioDTO, validationDTO, postCrearUsuario);
router.put('/admin/:id', autenticacionMidleware, esAdmin, editarUsuarioDTO, validationDTO, putEditarUsuarioAdmin);
router.put('/perfil/:id', autenticacionMidleware, editarUsuarioDTO, validationDTO, putEditarUsuarioPerfil);
router.delete('/:id', autenticacionMidleware, esAdmin, deleteUsuario);
router.post('/login', postIniciarSesion);

export default router;