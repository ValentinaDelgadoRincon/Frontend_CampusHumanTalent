import jwt from "jsonwebtoken";
import { Usuario } from "../validationSchemas.js";

export async function autenticacionMidleware(req, res, next) {
    try {
        // Intentar obtener token de las cookies primero
        let token = req.signedCookies.token;
        
        // Si no está en cookies, intentar obtenerlo del header Authorization
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7); // Eliminar "Bearer " del inicio
            }
        }

        if (!token) {
            return res.status(401).json({ mensaje: "No autorizado. No se proporcionó token." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const usuario = await Usuario.findById(decoded.id);

        if (!usuario) {
            return res.status(401).json({ mensaje: "No autorizado. Usuario no encontrado." });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "No autorizado. Token inválido o expirado." });
    }
}

export async function esAdmin(req, res, next) {
    try {
        const usuario = await Usuario.findById(req.usuario._id).populate('id_rol');
        
        if (!usuario) {
            return res.status(403).json({ mensaje: "Usuario no encontrado" });
        }

        if (usuario.id_rol.nombre !== 'Administrador') {
            return res.status(403).json({ mensaje: "Acceso denegado. Se requieren permisos de administrador" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ mensaje: "Error al verificar permisos: " + error.message });
    }
}