import { RespuestaEncuesta } from "../validationSchemas.js";
import mongoose from 'mongoose';

export async function obtenerRespuestasEncuestas() {
    try {
        return await RespuestaEncuesta.find().sort({ fecha_respuesta: -1 });
    } catch (error) {
        throw new Error("Error al obtener las respuestas de encuestas: " + error.message);
    }
}

export async function obtenerRespuestaEncuestaPorId(id) {
    try {
        const respuestaEncuesta = await RespuestaEncuesta.findById(id);
        if (!respuestaEncuesta) {
            throw new Error("Respuesta de encuesta no encontrada");
        }
        return respuestaEncuesta;
    } catch (error) {
        throw new Error("Error al obtener la respuesta de encuesta por ID: " + error.message);
    }
}

export async function obtenerRespuestasPorIdUsuarioEvaluador(id) {
    try {

        const usuarioEvaluador = await mongoose.model('Usuario').findById(id);
        if (!usuarioEvaluador) {
            throw new Error("Usuario evaluador no encontrado");
        }

        return await RespuestaEncuesta.find({ id_usuario_evaluador: id });
    } catch (error) {
        throw new Error("Error al obtener las respuestas de encuestas por usuario evaluador: " + error.message);
    }
}

export async function obtenerRespuestaEncuestaPorIdUsuarioEvaluado(id) {
    try {
        const usuarioEvaluado = await mongoose.model('Usuario').findById(id);
        if (!usuarioEvaluado) {
            throw new Error("Usuario evaluado no encontrado");
        }
        return await RespuestaEncuesta.find({ id_usuario_evaluado: id });
    } catch (error) {
        throw new Error("Error al obtener las respuestas de encuestas por usuario evaluado: " + error.message);
    }
}

export async function crearRespuestaEncuesta(datos) {
    try {
        const { 
            id_ciclo,
            id_encuesta, 
            id_usuario_evaluador, 
            id_usuario_evaluado, 
            id_area_trabajo, 
            id_cargo, 
            respuestas 
        } = datos;

        // 1. Validar campos requeridos
        if (!id_ciclo) {
            throw new Error("El ID del ciclo es obligatorio");
        }
        if (!id_encuesta) {
            throw new Error("El ID de la encuesta es obligatorio");
        }
        if (!id_usuario_evaluador) {
            throw new Error("El ID del usuario evaluador es obligatorio");
        }
        if (!id_usuario_evaluado) {
            throw new Error("El ID del usuario evaluado es obligatorio");
        }
        if (!id_area_trabajo) {
            throw new Error("El área de trabajo es obligatoria");
        }
        if (!id_cargo) {
            throw new Error("El cargo es obligatorio");
        }
        if (!Array.isArray(respuestas) || respuestas.length === 0) {
            throw new Error("Debe proporcionar al menos una respuesta");
        }

        // 2. Verificar que el ciclo existe y está abierto
        const ciclo = await mongoose.model('CicloEvaluacion').findById(id_ciclo);
        if (!ciclo) {
            throw new Error("El ciclo de evaluación no existe");
        }
        if (ciclo.estado !== 'Abierto') {
            throw new Error("El ciclo de evaluación está cerrado. No se pueden registrar nuevas respuestas");
        }

        const encuesta = await mongoose.model('Encuesta').findById(id_encuesta);
        if (!encuesta) {
            throw new Error("La encuesta no existe");
        }

        const evaluador = await mongoose.model('Usuario').findById(id_usuario_evaluador);
        if (!evaluador) {
            throw new Error("El usuario evaluador no existe");
        }

        const evaluado = await mongoose.model('Usuario').findById(id_usuario_evaluado);
        if (!evaluado) {
            throw new Error("El usuario evaluado no existe");
        }

        const areaTrabajo = await mongoose.model('AreaTrabajo').findById(id_area_trabajo);
        if (!areaTrabajo) {
            throw new Error("El área de trabajo no existe");
        }

        const cargo = await mongoose.model('Cargo').findById(id_cargo);
        if (!cargo) {
            throw new Error("El cargo no existe");
        }

        if (id_usuario_evaluador.toString() === id_usuario_evaluado.toString()) {
            throw new Error("Un usuario no puede evaluarse a sí mismo");
        }

        // 6. Verificar duplicados (mismo ciclo, encuesta, evaluador y evaluado)
        const respuestaExistente = await RespuestaEncuesta.findOne({
            id_ciclo,
            id_encuesta,
            id_usuario_evaluador,
            id_usuario_evaluado
        });
        if (respuestaExistente) {
            throw new Error("Ya existe una respuesta para esta combinación en este ciclo de evaluación");
        }

        const preguntasIds = respuestas.map(r => r.id_pregunta);

        const preguntas = await mongoose.model('Pregunta').find({ 
            _id: { $in: preguntasIds } 
        }).populate('id_tipo_respuesta');

        if (preguntas.length !== preguntasIds.length) {
            throw new Error("Una o más preguntas no existen");
        }

        const preguntasEncuestaIds = encuesta.id_preguntas.map(id => id.toString());
        const preguntasInvalidas = preguntasIds.filter(
            id => !preguntasEncuestaIds.includes(id.toString())
        );
        if (preguntasInvalidas.length > 0) {
            throw new Error("Una o más preguntas no pertenecen a esta encuesta");
        }

        const preguntasMap = {};
        preguntas.forEach(p => {
            preguntasMap[p._id.toString()] = p;
        });

        for (const respuesta of respuestas) {
            const pregunta = preguntasMap[respuesta.id_pregunta.toString()];
            const tipoRespuesta = pregunta.id_tipo_respuesta.nombre;

            if (!respuesta.respuesta || respuesta.respuesta === '') {
                throw new Error(`La respuesta para la pregunta "${pregunta.texto_pregunta}" es obligatoria`);
            }

            // Validar según tipo
            if (tipoRespuesta === 'Si o No') {
                if (respuesta.respuesta !== 'Sí' && respuesta.respuesta !== 'No') {
                    throw new Error(`La pregunta "${pregunta.texto_pregunta}" debe responderse con "Sí" o "No"`);
                }
            } else if (tipoRespuesta === 'Escala de Likert') {
                const valor = typeof respuesta.respuesta === 'number' 
                    ? respuesta.respuesta 
                    : parseInt(respuesta.respuesta);
                
                if (isNaN(valor) || valor < 1 || valor > 5) {
                    throw new Error(`La pregunta "${pregunta.texto_pregunta}" debe tener un valor entre 1 y 5`);
                }
            } else if (tipoRespuesta === 'Abierta') {
                if (typeof respuesta.respuesta !== 'string' || respuesta.respuesta.trim() === '') {
                    throw new Error(`La pregunta "${pregunta.texto_pregunta}" requiere una respuesta de texto`);
                }
            }
        }

        // 10. Crear la respuesta de encuesta
        const nuevaRespuestaEncuesta = new RespuestaEncuesta({
            id_ciclo,
            id_encuesta,
            id_usuario_evaluador,
            id_usuario_evaluado,
            id_area_trabajo,
            id_cargo,
            respuestas
        });

        return await nuevaRespuestaEncuesta.save();
        
    } catch (error) {
        throw new Error("Error al crear la respuesta de encuesta: " + error.message);
    }
}

export async function obtenerRespuestaEncuestaPorIdCiclo(id_ciclo) {
    try {
        const ciclo = await mongoose.model('CicloEvaluacion').findById(id_ciclo);

        if (!ciclo) {
            throw new Error("Ciclo de evaluación no encontrado");
        }
        
        return await RespuestaEncuesta.find({ id_ciclo: id_ciclo });
    } catch (error) {
        throw new Error("Error al obtener las respuestas de encuestas por ID de ciclo: " + error.message);
    }
}

