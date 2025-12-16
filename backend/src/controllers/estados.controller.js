import { obtenerEstados, obtenerEstadoPorId } from "../services/estados.services.js";

export async function getEstados(req, res) {
    try {
        const estados = await obtenerEstados();
        res.status(200).json(estados);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getEstadoPorId(req, res) {
    try {
        const { id } = req.params;
        const estado = await obtenerEstadoPorId(id);
        res.status(200).json(estado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}