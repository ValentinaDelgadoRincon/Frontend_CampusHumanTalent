import { obtenerTiposEncuestas, obtenerTipoEncuestaPorId, crearTipoEncuesta, eliminarTipoEncuesta, editarTipoEncuesta } from '../services/tipo_encuesta.services.js';

export async function getTiposEncuestas(req, res) {
    try {
        const tiposEncuestas = await obtenerTiposEncuestas();
        res.status(200).json(tiposEncuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getTipoEncuestaPorId(req, res) {
    try {
        const { id } = req.params;
        const tipoEncuesta = await obtenerTipoEncuestaPorId(id);
        res.status(200).json(tipoEncuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearTipoEncuesta(req, res) {
    try {
        const { nombre } = req.body;
        const nuevoTipoEncuesta = await crearTipoEncuesta(nombre);
        res.status(201).json(nuevoTipoEncuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarTipoEncuesta(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const tipoEncuestaActualizada = await editarTipoEncuesta(id, nombre);
        res.status(200).json(tipoEncuestaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteTipoEncuesta(req, res) {
    try {
        const { id } = req.params;
        await eliminarTipoEncuesta(id);
        res.status(200).json({ mensaje: "Tipo de encuesta eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}