import mongoose from 'mongoose';
import { Encuesta } from "../validationSchemas.js";

export async function obtenerEncuestas() {
    try {
        return await Encuesta.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener las encuestas: " + error.message);
    }
}

export async function obtenerEncuestaPorId(id) {
    try {
        const encuesta = await Encuesta.findById(id);
        if (!encuesta) {
            throw new Error("Encuesta no encontrada");
        }
        return encuesta;
    } catch (error) {
        throw new Error("Error al obtener la encuesta por ID: " + error.message);
    }
}

export async function crearEncuesta(nombre, descripcion, id_tipo_encuesta, id_preguntas) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre de la encuesta es obligatorio");
        }

        if (!descripcion || descripcion.trim() === '') {
            throw new Error("La descripción de la encuesta es obligatoria");
        }

        if (!id_tipo_encuesta) {
            throw new Error("El tipo de encuesta es obligatorio");
        }

        if (!Array.isArray(id_preguntas) || id_preguntas.length === 0) {
            throw new Error("La encuesta debe tener al menos una pregunta");
        }

        const encuestaExistente = await Encuesta.findOne({ nombre: nombre.trim() });
        if (encuestaExistente) {
            throw new Error("Ya existe una encuesta con ese nombre");
        }

        const tipoEncuesta = await mongoose.model('TipoEncuesta').findById(id_tipo_encuesta);
        if (!tipoEncuesta) {
            throw new Error("El tipo de encuesta no existe");
        }

        const preguntasEncontradas = await mongoose.model('Pregunta').find({ 
            _id: { $in: id_preguntas } 
        });
        
        if (preguntasEncontradas.length !== id_preguntas.length) {
            throw new Error("Una o más preguntas no existen en la base de datos");
        }

        const nuevaEncuesta = new Encuesta({ 
            nombre: nombre.trim(), 
            descripcion: descripcion.trim(), 
            id_tipo_encuesta, 
            id_preguntas 
        });
        
        return await nuevaEncuesta.save();
    } catch (error) {
        throw new Error("Error al crear la encuesta: " + error.message);
    }
}

export async function eliminarEncuesta(id) {
    try {
        const encuesta = await Encuesta.findById(id);
        if (!encuesta) {
            throw new Error("Encuesta no encontrada");
        }
        return await Encuesta.findByIdAndDelete(id);
    } catch (error) {
        throw new Error("Error al eliminar la encuesta: " + error.message);
    }
}

export async function editarEncuesta(id, datos) {
    try {
        const encuesta = await Encuesta.findById(id);
        if (!encuesta) {
            throw new Error("Encuesta no encontrada");
        }

        const { nombre, descripcion, id_tipo_encuesta, id_preguntas } = datos;

        if (nombre !== undefined) {
            if (nombre.trim() === '') {
                throw new Error("El nombre no puede estar vacío");
            }

            const nombreExiste = await Encuesta.findOne({ 
                nombre: nombre.trim(), 
                _id: { $ne: id } 
            });
            if (nombreExiste) {
                throw new Error("Ya existe una encuesta con ese nombre");
            }
            encuesta.nombre = nombre.trim();
        }

        if (descripcion !== undefined) {
            if (descripcion.trim() === '') {
                throw new Error("La descripción no puede estar vacía");
            }
            encuesta.descripcion = descripcion.trim();
        }

        if (id_tipo_encuesta !== undefined) {
            const tipoEncuesta = await mongoose.model('TipoEncuesta').findById(id_tipo_encuesta);
            if (!tipoEncuesta) {
                throw new Error("El tipo de encuesta no existe");
            }
            encuesta.id_tipo_encuesta = id_tipo_encuesta;
        }

        if (id_preguntas !== undefined) {
            if (!Array.isArray(id_preguntas) || id_preguntas.length === 0) {
                throw new Error("La encuesta debe tener al menos una pregunta");
            }

            const preguntasEncontradas = await mongoose.model('Pregunta').find({ 
                _id: { $in: id_preguntas } 
            });
            
            if (preguntasEncontradas.length !== id_preguntas.length) {
                throw new Error("Una o más preguntas no existen en la base de datos");
            }

            encuesta.id_preguntas = id_preguntas;
        }

        return await encuesta.save();
    } catch (error) {
        throw new Error("Error al editar la encuesta: " + error.message);
    }
}
