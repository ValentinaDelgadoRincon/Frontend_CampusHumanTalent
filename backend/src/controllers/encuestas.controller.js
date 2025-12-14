import { obtenerEncuestas, obtenerEncuestaPorId, crearEncuesta, editarEncuesta, eliminarEncuesta } from '../services/encuestas.services.js';

export async function getEncuestas(req, res) {
    try {
        const encuestas = await obtenerEncuestas();
        res.status(200).json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getEncuestaPorId(req, res) {
    try {
        const { id } = req.params;
        const encuesta = await obtenerEncuestaPorId(id);
        res.status(200).json(encuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearEncuesta(req, res) {
    try {
        const { nombre, descripcion, id_tipo_encuesta, id_preguntas } = req.body;
        const nuevaEncuesta = await crearEncuesta(nombre, descripcion, id_tipo_encuesta, id_preguntas);
        res.status(201).json(nuevaEncuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarEncuesta(req, res) {
    try {
        const { id } = req.params;
        const datos = req.body;
        const encuestaActualizada = await editarEncuesta(id, datos);
        res.status(200).json(encuestaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteEncuesta(req, res) {
    try {
        const { id } = req.params;
        await eliminarEncuesta(id);
        res.status(200).json({ mensaje: "Encuesta eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}