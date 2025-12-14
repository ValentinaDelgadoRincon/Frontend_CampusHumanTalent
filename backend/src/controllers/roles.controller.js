import { obtenerRolPorId, obtenerRoles } from "../services/roles.services.js";

export async function getRoles(req, res) {
    try {
        const roles = await obtenerRoles();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getRolPorId(req, res) {
    try {
        const { id } = req.params;
        const rol = await obtenerRolPorId(id);
        res.status(200).json(rol);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}