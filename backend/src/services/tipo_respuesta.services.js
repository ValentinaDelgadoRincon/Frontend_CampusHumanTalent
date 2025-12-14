import { TipoRespuesta } from "../validationSchemas.js";

export async function obtenerTiposRespuestas() {
    try {
        return await TipoRespuesta.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los tipos de respuesta: " + error.message);
    }
}

export async function obtenerTipoRespuestaPorId(id) {
    try {
        const tipoRespuesta = await TipoRespuesta.findById(id);
        if (!tipoRespuesta) {
            throw new Error("Tipo de respuesta no encontrado");
        }
        return tipoRespuesta;
    }
    catch (error) {
        throw new Error("Error al obtener el tipo de respuesta por ID: " + error.message);
    }
}

export async function crearTipoRespuesta(nombre, descripcion)  {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre del tipo de respuesta es obligatorio");
        }
        const tipoRespuestaExistente = await TipoRespuesta.findOne({ nombre: nombre });
        if (tipoRespuestaExistente) {
            throw new Error("El tipo de respuesta ya existe");
        }
        const nuevoTipoRespuesta = new TipoRespuesta({ nombre: nombre, descripcion: descripcion });
        return await nuevoTipoRespuesta.save();
    } catch (error) {
        throw new Error("Error al crear el tipo de respuesta: " + error.message);
    }
}

export async function eliminarTipoRespuesta(id) {
    try {
        const tipoRespuesta = await TipoRespuesta.findById(id);
        if (!tipoRespuesta) {
            throw new Error("Tipo de respuesta no encontrado");
        }
        return await tipoRespuesta.remove();
    } catch (error) {
        throw new Error("Error al eliminar el tipo de respuesta: " + error.message);
    }
}

export async function editarTipoRespuesta(id, datos) {
    try {
        const tipoRespuesta = await TipoRespuesta.findById(id);
        if (!tipoRespuesta) {
            throw new Error("Tipo de respuesta no encontrado");
        }
        Object.assign(tipoRespuesta, datos);
        return await tipoRespuesta.save();
    } catch (error) {
        throw new Error("Error al actualizar el tipo de respuesta: " + error.message);
    }
}
