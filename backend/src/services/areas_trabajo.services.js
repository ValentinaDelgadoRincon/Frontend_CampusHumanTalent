import { AreaTrabajo } from "../validationSchemas.js";

export async function obtenerAreasTrabajo() {
    try {
        return await AreaTrabajo.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener las áreas de trabajo: " + error.message);
    }
}

export async function editarAreaTrabajo(id, nombre) {
    try {
        const areaTrabajo = await AreaTrabajo.findById(id);

        if (!areaTrabajo) {
            throw new Error("Área de trabajo no encontrada");
        }

        areaTrabajo.nombre = nombre;
        return await areaTrabajo.save();
    } catch (error) {
        throw new Error("Error al actualizar el área de trabajo: " + error.message);
    }
}

export async function obtenerAreaTrabajoPorId(id) {
    try {
        const areaTrabajo = await AreaTrabajo.findById(id);
        if (!areaTrabajo) {
            throw new Error("Área de trabajo no encontrada");
        }
        return areaTrabajo;
    } catch (error) {
        throw new Error("Error al obtener el área de trabajo por ID: " + error.message);
    }
}

export async function crearAreaTrabajo(nombre) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre del área de trabajo es obligatorio");
        }

        const areaTrabajoExistente = await AreaTrabajo.findOne({ nombre: nombre });

        if (areaTrabajoExistente) {
            throw new Error("El área de trabajo ya existe");
        }

        const nuevaArea = new AreaTrabajo({ nombre: nombre });
        return await nuevaArea.save();
    } catch (error) {
        throw new Error("Error al crear el área de trabajo: " + error.message);
    }
}

export async function eliminarAreaTrabajo(id) {
    try {
        const areaTrabajo = await AreaTrabajo.findById(id);
        
        if (!areaTrabajo) {
            throw new Error("Área de trabajo no encontrada");
        }

        return await AreaTrabajo.findByIdAndDelete(id);
    } catch (error) {
        throw new Error("Error al eliminar el área de trabajo: " + error.message);
    }
}