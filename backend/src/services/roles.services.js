import { Rol } from "../validationSchemas.js";

export async function obtenerRoles() {
    try {
        return await Rol.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los roles: " + error.message);
    }
}

export async function obtenerRolPorId(id) {
    try {
        const rol = await Rol.findById(id);
        if (!rol) {
            throw new Error("Rol no encontrado");
        }
        return rol;
    } catch (error) {
        throw new Error("Error al obtener el rol por ID: " + error.message);
    }
}