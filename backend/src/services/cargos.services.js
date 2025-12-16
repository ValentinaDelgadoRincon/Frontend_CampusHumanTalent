import { Cargo } from "../validationSchemas.js";

export async function obtenerCargos() {
    try {
        return await Cargo.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los cargos: " + error.message);
    }
}

export async function editarCargo(id, nombre) {
    try {
        const cargo = await Cargo.findById(id);
        if (!cargo) {
            throw new Error("Cargo no encontrado");
        }
        cargo.nombre = nombre;
        return await cargo.save();
    } catch (error) {
        throw new Error("Error al actualizar el cargo: " + error.message);
    }
}

export async function obtenerCargoPorId(id) {
    try {
        const cargo = await Cargo.findById(id);
        if (!cargo) {
            throw new Error("Cargo no encontrado");
        }
        return cargo;
    } catch (error) {
        throw new Error("Error al obtener el cargo por ID: " + error.message);
    }
}

export async function crearCargo(nombre) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre del cargo es obligatorio");
        }
        const cargoExistente = await Cargo.findOne({ nombre: nombre });
        if (cargoExistente) {
            throw new Error("El cargo ya existe");
        }
        const nuevoCargo = new Cargo({ nombre: nombre });
        return await nuevoCargo.save();
    } catch (error) {
        throw new Error("Error al crear el cargo: " + error.message);
    }
}

export async function eliminarCargo(id) {
    try {
        const cargo = await Cargo.findById(id);
        if (!cargo) {
            throw new Error("Cargo no encontrado");
        }
        return await cargo.remove();
    } catch (error) {
        throw new Error("Error al eliminar el cargo: " + error.message);
    }
}