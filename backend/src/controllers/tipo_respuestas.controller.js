import { obtenerTiposRespuestas, obtenerTipoRespuestaPorId, crearTipoRespuesta, eliminarTipoRespuesta, editarTipoRespuesta } from "../services/tipo_respuesta.services.js";

export async function getTiposRespuestas(req, res) {
    try {
        const tiposRespuestas = await obtenerTiposRespuestas();
        res.status(200).json(tiposRespuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getTipoRespuestaPorId(req, res) {
    try {
        const { id } = req.params;
        const tipoRespuesta = await obtenerTipoRespuestaPorId(id);
        res.status(200).json(tipoRespuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearTipoRespuesta(req, res) {
    try {
        const { nombre, descripcion } = req.body;
        const nuevoTipoRespuesta = await crearTipoRespuesta(nombre, descripcion);
        res.status(201).json(nuevoTipoRespuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarTipoRespuesta(req, res) {
    try {
        const { id } = req.params;
        const datos = req.body;
        const tipoRespuestaActualizada = await editarTipoRespuesta(id, datos);
        res.status(200).json(tipoRespuestaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteTipoRespuesta(req, res) {
    try {
        const { id } = req.params;
        await eliminarTipoRespuesta(id);
        res.status(200).json({ mensaje: "Tipo de respuesta eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}