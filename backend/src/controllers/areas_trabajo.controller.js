import { obtenerAreasTrabajo, editarAreaTrabajo, obtenerAreaTrabajoPorId, eliminarAreaTrabajo, crearAreaTrabajo  } from "../services/areas_trabajo.services.js";

export async function getAreasTrabajo(req, res) {
    try {
        const areas =  await obtenerAreasTrabajo();
        res.status(200).json(areas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function getAreadeTrabajoPorId(req, res) {
    try {
        const { id } = req.params;
        const area = await obtenerAreaTrabajoPorId(id);
        res.status(200).json(area);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function postCrearAreaTrabajo(req, res) {
    try {
        const { nombre } = req.body;
        const nuevaArea = await crearAreaTrabajo(nombre);
        res.status(201).json(nuevaArea);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function putEditarAreaTrabajo(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const areaActualizada = await editarAreaTrabajo(id, nombre);
        res.status(200).json(areaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}

export async function deleteAreaTrabajo(req, res) {
    try {
        const { id } = req.params;
        await eliminarAreaTrabajo(id);
        res.status(200).json({ mensaje: "Área de trabajo eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}