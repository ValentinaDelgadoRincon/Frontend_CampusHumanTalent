import { CicloEvaluacion } from "../validationSchemas.js";
import mongoose from 'mongoose';

export async function obtenerCiclosEvaluacion() {
    try {
        return await CicloEvaluacion.find().sort({ fecha_inicio: -1 });
    } catch (error) {
        throw new Error("Error al obtener los ciclos de evaluación: " + error.message);
    }
}

export async function obtenerCicloEvaluacionPorId(id) {
    try {
        const cicloEvaluacion = await CicloEvaluacion.findById(id);
        if (!cicloEvaluacion) {
            throw new Error("Ciclo de evaluación no encontrado");
        }
        return cicloEvaluacion;
    } catch (error) {
        throw new Error("Error al obtener el ciclo de evaluación por ID: " + error.message);
    }
}

export async function crearCicloEvaluacion(datosCiclo) {
    try {
        const { nombre, descripcion, encuesta_Id, fecha_inicio, fecha_fin, creado_por } = datosCiclo;

        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre del ciclo de evaluación es obligatorio");
        }

        if (!descripcion || descripcion.trim() === '') {
            throw new Error("La descripción del ciclo de evaluación es obligatoria");
        }

        if (!encuesta_Id) {
            throw new Error("El ID de la encuesta es obligatorio");
        }

        if (!fecha_inicio) {
            throw new Error("La fecha de inicio es obligatoria");
        }

        if (!fecha_fin) {
            throw new Error("La fecha de fin es obligatoria");
        }

        if (!creado_por) {
            throw new Error("El creador del ciclo de evaluación es obligatorio");
        }

        const usuarioCreador = await mongoose.model('Usuario').findById(creado_por);
        if (!usuarioCreador) {
            throw new Error("El usuario creador no existe");
        }

        const encuesta = await mongoose.model('Encuesta').findById(encuesta_Id);
        if (!encuesta) {
            throw new Error("La encuesta asociada no existe");
        }

        const nuevoCicloEvaluacion = new CicloEvaluacion({ 
            nombre: nombre.trim(), 
            descripcion: descripcion.trim(),
            encuesta_Id, 
            fecha_inicio, 
            fecha_fin,
            creado_por,
            estado: 'Abierto'
        });
        return await nuevoCicloEvaluacion.save();
    } catch (error) {
        throw new Error("Error al crear el ciclo de evaluación: " + error.message);
    }
}

export async function cambiarEstadoCicloEvaluacion(id) {
    try {
        const cicloEvaluacion = await CicloEvaluacion.findById(id);

        if (!cicloEvaluacion) {
            throw new Error("Ciclo de evaluación no encontrado");
        }

        cicloEvaluacion.estado = "Cerrado";
        return await cicloEvaluacion.save();
    } catch (error) {
        throw new Error("Error al cambiar el estado del ciclo de evaluación: " + error.message);
    }
}