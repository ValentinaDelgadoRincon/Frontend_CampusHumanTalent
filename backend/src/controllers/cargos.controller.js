import { obtenerCargos, obtenerCargoPorId, eliminarCargo, editarCargo, crearCargo } from '../services/cargos.services.js';

export async function getCargos(req, res) {
    try {
        const cargos = await obtenerCargos();
        res.status(200).json(cargos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getCargoPorId(req, res) {
    try {
        const { id } = req.params;
        const cargo = await obtenerCargoPorId(id);
        res.status(200).json(cargo);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearCargo(req, res) {
    try {
        const { nombre } = req.body;
        const nuevoCargo = await crearCargo(nombre);
        res.status(201).json(nuevoCargo);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarCargo(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const cargoActualizado = await editarCargo(id, nombre);
        res.status(200).json(cargoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteCargo(req, res) {
    try {
        const { id } = req.params;
        await eliminarCargo(id);
        res.status(200).json({ mensaje: "Cargo eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}
