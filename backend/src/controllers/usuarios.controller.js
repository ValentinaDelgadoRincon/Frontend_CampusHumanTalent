import { obtenerUsuarios, obtenerUsuarioPorId, crearUsuario, eliminarUsuario, editarUsuarioAdmin, editarUsuarioPerfil, iniciarSesion } from "../services/usuarios.services.js";

export async function getUsuarios(req, res) {
    try {
        const usuarios = await obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getUsuarioPorId(req, res) {
    try {
        const { id } = req.params;
        const usuario = await obtenerUsuarioPorId(id);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearUsuario(req, res) {
    try {
        const datos = req.body;
        const nuevoUsuario = await crearUsuario(datos);

        res.cookie('token', nuevoUsuario.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json(nuevoUsuario);
    }
    catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarUsuarioAdmin(req, res) {
    try {
        const { id } = req.params;
        const datos = req.body;
        const usuarioActualizado = await editarUsuarioAdmin(id, datos);
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarUsuarioPerfil(req, res) {
    try {
        const { id } = req.params;
        const datos = req.body;
        const usuarioActualizado = await editarUsuarioPerfil(id, datos);
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteUsuario(req, res) {
    try {
        const { id } = req.params;
        await eliminarUsuario(id);
        res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postIniciarSesion(req, res) {
    try {
        const { email, password } = req.body;
        const resultado = await iniciarSesion(email, password);
        
        res.cookie('token', resultado.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.status(200).json(resultado);
    } catch (error) {
        res.status(401).json({ mensaje: error.message });
    }
}