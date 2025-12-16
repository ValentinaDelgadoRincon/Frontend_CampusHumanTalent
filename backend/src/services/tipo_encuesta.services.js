import { TipoEncuesta } from "../validationSchemas.js";

export async function obtenerTiposEncuestas() {
    try {
        return await TipoEncuesta.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los tipos de encuestas: " + error.message);
    }
}

export async function obtenerTipoEncuestaPorId(id) {
    try {
        const tipoEncuesta = await TipoEncuesta.findById(id);
        if (!tipoEncuesta) {
            throw new Error("Tipo de encuesta no encontrado");
        }
        return tipoEncuesta;
    } catch (error) {
        throw new Error("Error al obtener el tipo de encuesta por ID: " + error.message);
    }
}

export async function crearTipoEncuesta(nombre, descripcion) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre del tipo de encuesta es obligatorio");
        }
        const tipoEncuestaExistente = await TipoEncuesta.findOne({ nombre: nombre });
        if (tipoEncuestaExistente) {
            throw new Error("El tipo de encuesta ya existe");
        }
        const nuevoTipoEncuesta = new TipoEncuesta({ nombre: nombre, descripcion: descripcion });
        return await nuevoTipoEncuesta.save();
    } catch (error) {
        throw new Error("Error al crear el tipo de encuesta: " + error.message);
    }
}

export async function eliminarTipoEncuesta(id) {
    try {
        const tipoEncuesta = await TipoEncuesta.findById(id);
        if (!tipoEncuesta) {
            throw new Error("Tipo de encuesta no encontrado");
        }
        return await tipoEncuesta.remove();
    } catch (error) {
        throw new Error("Error al eliminar el tipo de encuesta: " + error.message);
    }
}

export async function editarTipoEncuesta(id, datos) {
    try {
        const tipoEncuesta = await TipoEncuesta.findById(id);
        if (!tipoEncuesta) {
            throw new Error("Tipo de encuesta no encontrado");
        }
        
        Object.assign(tipoEncuesta, datos);  // ✅ Más confiable
        
        return await tipoEncuesta.save();
    } catch (error) {
        throw new Error("Error al actualizar el tipo de encuesta: " + error.message);
    }
}