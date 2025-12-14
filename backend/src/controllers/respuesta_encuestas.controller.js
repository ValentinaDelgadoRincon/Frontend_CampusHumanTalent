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
        console.log(datos);
        
        const nuevaRespuestaEncuesta = await crearRespuestaEncuesta(datos);
        res.status(201).json(nuevaRespuestaEncuesta);
    } catch (error) {
        // Validar si es un error de duplicado
        if (error.message.includes("Ya existe una respuesta")) {
            return res.status(409).json({ mensaje: error.message });
        }
        // Validar si es un error de validación
        if (error.message.includes("obligatorio") || 
            error.message.includes("no existe") ||
            error.message.includes("está cerrado") ||
            error.message.includes("no puede evaluarse a sí mismo") ||
            error.message.includes("debe responderse") ||
            error.message.includes("debe tener un valor") ||
            error.message.includes("requiere una respuesta")) {
            return res.status(400).json({ mensaje: error.message });
        }
        // Otros errores del servidor
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
