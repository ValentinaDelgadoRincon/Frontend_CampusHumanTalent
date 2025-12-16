import { obtenerRespuestaEncuestaPorId, obtenerRespuestasEncuestas, obtenerRespuestaEncuestaPorIdUsuarioEvaluado, obtenerRespuestasPorIdUsuarioEvaluador, crearRespuestaEncuesta, obtenerRespuestaEncuestaPorIdCiclo } from "../services/respuesta_encuestas.services.js";

export async function getRespuestasEncuestas(req, res) {
    try {
        const respuestasEncuestas = await obtenerRespuestasEncuestas();
        res.status(200).json(respuestasEncuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getRespuestaEncuestaPorId(req, res) {
    try {
        const { id } = req.params;
        const respuestaEncuesta = await obtenerRespuestaEncuestaPorId(id);
        res.status(200).json(respuestaEncuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getRespuestasPorIdUsuarioEvaluador(req, res) {
    try {
        const { id } = req.params;
        const respuestas = await obtenerRespuestasPorIdUsuarioEvaluador(id);
        res.status(200).json(respuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getRespuestaEncuestaPorIdUsuarioEvaluado(req, res) {
    try {
        const { id } = req.params;
        const respuestas = await obtenerRespuestaEncuestaPorIdUsuarioEvaluado(id);
        res.status(200).json(respuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearRespuestaEncuesta(req, res) {
    try {
        const datos = req.body;
        const nuevaRespuestaEncuesta = await crearRespuestaEncuesta(datos);
        res.status(201).json(nuevaRespuestaEncuesta);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getRespuestaEncuestaPorIdCiclo(req, res) {
    try {
        const { id } = req.params;
        const respuestas = await obtenerRespuestaEncuestaPorIdCiclo(id);
        res.status(200).json(respuestas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}
