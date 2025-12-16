import { obtenerPreguntas, obtenerPreguntaPorId, crearPregunta, eliminarPregunta, editarPregunta } from "../services/preguntas.services.js";

export async function getPreguntas(req, res) {
    try {
        const preguntas = await obtenerPreguntas();
        res.status(200).json(preguntas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getPreguntaPorId(req, res) {
    try {
        const { id } = req.params;
        const pregunta = await obtenerPreguntaPorId(id);
        res.status(200).json(pregunta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearPregunta(req, res) {
    try {
        const { texto, id_tipo_pregunta, id_tipo_respuesta } = req.body;
        const nuevaPregunta = await crearPregunta(texto, id_tipo_pregunta, id_tipo_respuesta);
        res.status(201).json(nuevaPregunta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarPregunta(req, res) {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;
        const preguntaActualizada = await editarPregunta(id, datosActualizados);
        res.status(200).json(preguntaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deletePregunta(req, res) {
    try {
        const { id } = req.params;
        await eliminarPregunta(id);
        res.status(200).json({ mensaje: "Pregunta eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}