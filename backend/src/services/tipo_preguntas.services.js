import { TipoPregunta } from "../validationSchemas.js";

export async function obtenerTiposPreguntas() {
    try {
        return await TipoPregunta.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los tipos de preguntas: " + error.message);
    }
}

export async function obtenerTipoPreguntaPorId(id) {
    try {
        const tipoPregunta = await TipoPregunta.findById(id);
        if (!tipoPregunta) {
            throw new Error("Tipo de pregunta no encontrado");
        }
        return tipoPregunta;
    } catch (error) {
        throw new Error("Error al obtener el tipo de pregunta por ID: " + error.message);
    }
}

export async function crearTipoPregunta(nombre) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre del tipo de pregunta es obligatorio");
        }
        const tipoPreguntaExistente = await TipoPregunta.findOne({ nombre: nombre });
        if (tipoPreguntaExistente) {
            throw new Error("El tipo de pregunta ya existe");
        }
        const nuevoTipoPregunta = new TipoPregunta({ nombre: nombre });
        return await nuevoTipoPregunta.save();
    } catch (error) {
        throw new Error("Error al crear el tipo de pregunta: " + error.message);
    }
}

export async function eliminarTipoPregunta(id) {
    try {
        const tipoPregunta = await TipoPregunta.findById(id);
        if (!tipoPregunta) {
            throw new Error("Tipo de pregunta no encontrado");
        }
        return await tipoPregunta.remove();
    } catch (error) {
        throw new Error("Error al eliminar el tipo de pregunta: " + error.message);
    }
}

export async function editarTipoPregunta(id, datos) {
    try {
        const tipoPregunta = await TipoPregunta.findById(id);
        if (!tipoPregunta) {
            throw new Error("Tipo de pregunta no encontrado");
        }
        Object.assign(tipoPregunta, datos);
        return await tipoPregunta.save();
    } catch (error) {
        throw new Error("Error al actualizar el tipo de pregunta: " + error.message);
    }
}