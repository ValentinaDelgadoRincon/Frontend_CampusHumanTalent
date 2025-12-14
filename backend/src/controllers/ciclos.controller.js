import { obtenerCiclosEvaluacion, obtenerCicloEvaluacionPorId, crearCicloEvaluacion, cambiarEstadoCicloEvaluacion } from "../services/ciclos.services.js";

export async function getCiclosEvaluacion(req, res) {
    try {
        const ciclosEvaluacion = await obtenerCiclosEvaluacion();
        res.status(200).json(ciclosEvaluacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getCicloEvaluacionPorId(req, res) {
    try {
        const { id } = req.params;
        const cicloEvaluacion = await obtenerCicloEvaluacionPorId(id);
        res.status(200).json(cicloEvaluacion);
    }
    catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearCicloEvaluacion(req, res) {
    try {
        const datosCiclo = req.body;
        const nuevoCicloEvaluacion = await crearCicloEvaluacion(datosCiclo);
        res.status(201).json(nuevoCicloEvaluacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putCambiarEstadoCicloEvaluacion(req, res) {
    try {
        const { id } = req.params;
        const cicloActualizado = await cambiarEstadoCicloEvaluacion(id);
        res.status(200).json(cicloActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}