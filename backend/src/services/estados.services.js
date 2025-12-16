import { Estado } from "../validationSchemas.js";

export async function obtenerEstados() {
    try {
        return await Estado.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los estados: " + error.message);
    }
}

export async function obtenerEstadoPorId(id) {
    try {
        const estado = await Estado.findById(id);
        if (!estado) {
            throw new Error("Estado no encontrado");
        }
        return estado;
    } catch (error) {
        throw new Error("Error al obtener el estado por ID: " + error.message);
    }
}

