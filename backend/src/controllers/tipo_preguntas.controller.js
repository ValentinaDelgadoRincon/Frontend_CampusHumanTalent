import { obtenerTiposPreguntas, obtenerTipoPreguntaPorId, crearTipoPregunta, editarTipoPregunta, eliminarTipoPregunta } from '../services/tipo_preguntas.services.js';

export async function getTiposPreguntas(req, res) {
    try {
        const tiposPreguntas = await obtenerTiposPreguntas();
        res.status(200).json(tiposPreguntas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getTipoPreguntaPorId(req, res) {
    try {
        const { id } = req.params;
        const tipoPregunta = await obtenerTipoPreguntaPorId(id);
        res.status(200).json(tipoPregunta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearTipoPregunta(req, res) {
    try {
        const { nombre } = req.body;
        const nuevoTipoPregunta = await crearTipoPregunta(nombre);
        res.status(201).json(nuevoTipoPregunta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarTipoPregunta(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const tipoPreguntaActualizada = await editarTipoPregunta(id, nombre);
        res.status(200).json(tipoPreguntaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteTipoPregunta(req, res) {
    try {
        const { id } = req.params;
        await eliminarTipoPregunta(id);
        res.status(200).json({ mensaje: "Tipo de pregunta eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

