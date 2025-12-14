import { Pregunta } from "../validationSchemas.js";
import mongoose from 'mongoose';

export async function obtenerPreguntas() {
    try {
        return await Pregunta.find().sort({ pregunta: 1 });
    } catch (error) {
        throw new Error("Error al obtener las preguntas: " + error.message);
    }
}

export async function obtenerPreguntaPorId(id) {
    try {
        const pregunta = await Pregunta.findById(id);
        if (!pregunta) {
            throw new Error("Pregunta no encontrada");
        }
        return pregunta;
    } catch (error) {
        throw new Error("Error al obtener la pregunta por ID: " + error.message);
    }
}

export async function crearPregunta(pregunta, id_tipo_pregunta, id_tipo_respuesta) {
    try {
        if (!pregunta || pregunta.trim() === '') {
            throw new Error("El texto de la pregunta es obligatorio");
        }

        const preguntaExistente = await Pregunta.findOne({ pregunta: pregunta });

        if (preguntaExistente) {
            throw new Error("La pregunta ya existe");
        }

        const tipoPregunta = await mongoose.model('TipoPregunta').findById(id_tipo_pregunta);
        if (!tipoPregunta) {
            throw new Error("El tipo de pregunta no existe");
        }

        const tipoRespuesta = await mongoose.model('TipoRespuesta').findById(id_tipo_respuesta);
        if (!tipoRespuesta) {
            throw new Error("El tipo de respuesta no existe");
        }

        const nuevaPregunta = new Pregunta({ pregunta: pregunta, id_tipo_pregunta: id_tipo_pregunta, id_tipo_respuesta: id_tipo_respuesta });
        return await nuevaPregunta.save();
    } catch (error) {
        throw new Error("Error al crear la pregunta: " + error.message);
    }
}

export async function eliminarPregunta(id) {
    try {
        const pregunta = await Pregunta.findById(id);
        if (!pregunta) {
            throw new Error("Pregunta no encontrada");
        }
        return await pregunta.remove();
    } catch (error) {
        throw new Error("Error al eliminar la pregunta: " + error.message);
    }
}

export async function editarPregunta(id, datosActualizados) {

    try {
        const pregunta = await Pregunta.findById(id);
        if (!pregunta) {
            throw new Error("Pregunta no encontrada");
        }

    const { texto, id_tipo_pregunta, id_tipo_respuesta } = datosActualizados;

    if (texto !== undefined) {
        if (texto.trim() === '') {
            throw new Error("El texto de la pregunta no puede estar vacío");
        }

        const textoExiste = await Pregunta.findOne({ 
            texto: texto.trim(), 
            _id: { $ne: id } 
        });

        if (textoExiste) {
            throw new Error("Ya existe una pregunta con ese texto");
        }

        datosActualizados.texto = texto.trim();
    }

    if (id_tipo_pregunta !== undefined) {
        const tipoPregunta = await mongoose.model('TipoPregunta').findById(id_tipo_pregunta);
        if (!tipoPregunta) {
            throw new Error("El tipo de pregunta no existe");
        }

        datosActualizados.id_tipo_pregunta = id_tipo_pregunta;
    }

    if (id_tipo_respuesta !== undefined) {
        const tipoRespuesta = await mongoose.model('TipoRespuesta').findById(id_tipo_respuesta);
        if (!tipoRespuesta) {
            throw new Error("El tipo de respuesta no existe");
        }
        datosActualizados.id_tipo_respuesta = id_tipo_respuesta;
    }

        Object.assign(pregunta, datosActualizados);
        return await pregunta.save();
    } catch (error) {
        throw new Error("Error al editar la pregunta: " + error.message);
    }

}