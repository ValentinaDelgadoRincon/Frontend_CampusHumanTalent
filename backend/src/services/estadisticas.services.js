import { Usuario, RespuestaEncuesta, CicloEvaluacion } from "../validationSchemas.js";
import mongoose from 'mongoose';

/**
 * Calcula y actualiza las estadísticas de evaluación de un usuario
 * @param {string} id_usuario - ID del usuario a actualizar
 * @returns {Object} Estadísticas actualizadas
 */
export async function calcularYActualizarEstadisticas(id_usuario) {
    try {
        // Verificar que el usuario existe
        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        // Obtener todas las evaluaciones donde el usuario fue evaluado
        const evaluaciones = await RespuestaEncuesta.find({ 
            id_usuario_evaluado: id_usuario 
        }).populate('id_ciclo');

        if (evaluaciones.length === 0) {
            // Si no tiene evaluaciones, resetear estadísticas
            usuario.estadisticas_evaluacion = {
                promedio_general: 0,
                total_evaluaciones: 0,
                ultimo_calculo: new Date(),
                evaluaciones_por_ciclo: []
            };
            await usuario.save();
            return usuario.estadisticas_evaluacion;
        }

        // Agrupar evaluaciones por ciclo
        const evaluacionesPorCiclo = {};
        evaluaciones.forEach(ev => {
            const cicloId = ev.id_ciclo._id.toString();
            if (!evaluacionesPorCiclo[cicloId]) {
                evaluacionesPorCiclo[cicloId] = {
                    id_ciclo: ev.id_ciclo._id,
                    nombre_ciclo: ev.id_ciclo.nombre,
                    evaluaciones: []
                };
            }
            evaluacionesPorCiclo[cicloId].evaluaciones.push(ev);
        });

        // Calcular promedio por ciclo
        const evaluacionesPorCicloArray = [];
        let sumaPromediosCiclos = 0;
        let totalCiclos = 0;

        for (const cicloId in evaluacionesPorCiclo) {
            const cicloData = evaluacionesPorCiclo[cicloId];
            const evaluacionesCiclo = cicloData.evaluaciones;

            // Calcular promedio del ciclo (promedio de todos los promedios normalizados)
            const sumaPromedios = evaluacionesCiclo.reduce((sum, ev) => {
                return sum + (ev.promedio_normalizado || 0);
            }, 0);

            const promedioCiclo = evaluacionesCiclo.length > 0 
                ? Math.round(sumaPromedios / evaluacionesCiclo.length) 
                : 0;

            evaluacionesPorCicloArray.push({
                id_ciclo: cicloData.id_ciclo,
                promedio_ciclo: promedioCiclo,
                total_respuestas: evaluacionesCiclo.length,
                fecha_calculo: new Date()
            });

            sumaPromediosCiclos += promedioCiclo;
            totalCiclos++;
        }

        // Calcular promedio general (promedio de todos los ciclos)
        const promedioGeneral = totalCiclos > 0 
            ? Math.round(sumaPromediosCiclos / totalCiclos) 
            : 0;

        // Actualizar estadísticas del usuario
        usuario.estadisticas_evaluacion = {
            promedio_general: promedioGeneral,
            total_evaluaciones: evaluaciones.length,
            ultimo_calculo: new Date(),
            evaluaciones_por_ciclo: evaluacionesPorCicloArray
        };

        await usuario.save();

        return usuario.estadisticas_evaluacion;
    } catch (error) {
        throw new Error("Error al calcular estadísticas: " + error.message);
    }
}

/**
 * Obtiene las estadísticas de evaluación de un usuario
 * @param {string} id_usuario - ID del usuario
 * @param {boolean} recalcular - Si debe recalcular las estadísticas
 * @returns {Object} Estadísticas del usuario
 */
export async function obtenerEstadisticasUsuario(id_usuario, recalcular = false) {
    try {
        const usuario = await Usuario.findById(id_usuario)
            .populate({
                path: 'estadisticas_evaluacion.evaluaciones_por_ciclo.id_ciclo',
                select: 'nombre descripcion fecha_inicio fecha_fin estado'
            });

        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        // Si se solicita recalcular o no tiene estadísticas
        if (recalcular || !usuario.estadisticas_evaluacion.ultimo_calculo) {
            await calcularYActualizarEstadisticas(id_usuario);
            // Volver a obtener el usuario actualizado
            return await Usuario.findById(id_usuario)
                .populate({
                    path: 'estadisticas_evaluacion.evaluaciones_por_ciclo.id_ciclo',
                    select: 'nombre descripcion fecha_inicio fecha_fin estado'
                });
        }

        return usuario;
    } catch (error) {
        throw new Error("Error al obtener estadísticas: " + error.message);
    }
}

/**
 * Obtiene estadísticas detalladas de un usuario en un ciclo específico
 * @param {string} id_usuario - ID del usuario
 * @param {string} id_ciclo - ID del ciclo
 * @returns {Object} Estadísticas detalladas del ciclo
 */
export async function obtenerEstadisticasPorCiclo(id_usuario, id_ciclo) {
    try {
        // Verificar que el usuario existe
        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        // Verificar que el ciclo existe
        const ciclo = await CicloEvaluacion.findById(id_ciclo);
        if (!ciclo) {
            throw new Error("Ciclo no encontrado");
        }

        // Obtener todas las evaluaciones del usuario en ese ciclo
        const evaluaciones = await RespuestaEncuesta.find({
            id_usuario_evaluado: id_usuario,
            id_ciclo: id_ciclo
        })
        .populate('id_usuario_evaluador', 'nombre apellido email')
        .populate('id_encuesta', 'nombre descripcion')
        .populate({
            path: 'respuestas.id_pregunta',
            populate: {
                path: 'id_tipo_pregunta id_tipo_respuesta'
            }
        });

        if (evaluaciones.length === 0) {
            return {
                id_usuario,
                id_ciclo,
                ciclo: {
                    nombre: ciclo.nombre,
                    descripcion: ciclo.descripcion,
                    estado: ciclo.estado
                },
                total_evaluaciones: 0,
                promedio_ciclo: 0,
                evaluaciones: []
            };
        }

        // Calcular promedio del ciclo
        const sumaPromedios = evaluaciones.reduce((sum, ev) => {
            return sum + (ev.promedio_normalizado || 0);
        }, 0);
        const promedioCiclo = Math.round(sumaPromedios / evaluaciones.length);

        // Agrupar respuestas por tipo de pregunta para análisis
        const estadisticasPorTipo = {};
        evaluaciones.forEach(evaluacion => {
            evaluacion.respuestas.forEach(respuesta => {
                if (respuesta.id_pregunta && respuesta.id_pregunta.id_tipo_pregunta) {
                    const tipoPregunta = respuesta.id_pregunta.id_tipo_pregunta.nombre;
                    if (!estadisticasPorTipo[tipoPregunta]) {
                        estadisticasPorTipo[tipoPregunta] = {
                            suma: 0,
                            cantidad: 0,
                            maximo_posible: 0
                        };
                    }
                    estadisticasPorTipo[tipoPregunta].suma += respuesta.valor_numerico || 0;
                    estadisticasPorTipo[tipoPregunta].cantidad++;
                    
                    // Calcular máximo posible según el tipo de respuesta
                    const tipoRespuesta = respuesta.id_pregunta.id_tipo_respuesta?.nombre;
                    if (tipoRespuesta === 'Si o No') {
                        estadisticasPorTipo[tipoPregunta].maximo_posible += 1;
                    } else if (tipoRespuesta === 'Escala de Likert') {
                        estadisticasPorTipo[tipoPregunta].maximo_posible += 5;
                    }
                }
            });
        });

        // Calcular promedios por tipo
        const promediosPorTipo = {};
        for (const tipo in estadisticasPorTipo) {
            const data = estadisticasPorTipo[tipo];
            promediosPorTipo[tipo] = {
                promedio_normalizado: data.maximo_posible > 0 
                    ? Math.round((data.suma / data.maximo_posible) * 100)
                    : 0,
                total_preguntas: data.cantidad
            };
        }

        return {
            id_usuario,
            id_ciclo,
            ciclo: {
                nombre: ciclo.nombre,
                descripcion: ciclo.descripcion,
                estado: ciclo.estado,
                fecha_inicio: ciclo.fecha_inicio,
                fecha_fin: ciclo.fecha_fin
            },
            total_evaluaciones: evaluaciones.length,
            promedio_ciclo: promedioCiclo,
            estadisticas_por_tipo: promediosPorTipo,
            evaluaciones: evaluaciones.map(ev => ({
                id: ev._id,
                evaluador: {
                    nombre: ev.id_usuario_evaluador.nombre,
                    apellido: ev.id_usuario_evaluador.apellido,
                    email: ev.id_usuario_evaluador.email
                },
                encuesta: {
                    nombre: ev.id_encuesta.nombre,
                    descripcion: ev.id_encuesta.descripcion
                },
                promedio_normalizado: ev.promedio_normalizado,
                total: ev.total,
                puntaje_maximo_posible: ev.puntaje_maximo_posible,
                fecha_realizacion: ev.fecha_realizacion
            }))
        };
    } catch (error) {
        throw new Error("Error al obtener estadísticas por ciclo: " + error.message);
    }
}

/**
 * Obtiene un ranking de usuarios por promedio general
 * @param {Object} filtros - Filtros opcionales (área, cargo, etc.)
 * @param {number} limite - Número máximo de resultados
 * @returns {Array} Ranking de usuarios
 */
export async function obtenerRankingUsuarios(filtros = {}, limite = 10) {
    try {
        const query = { id_estado: filtros.id_estado };

        if (filtros.id_area_trabajo) {
            query.id_area_trabajo = filtros.id_area_trabajo;
        }

        if (filtros.id_cargo) {
            query.id_cargo = filtros.id_cargo;
        }

        const usuarios = await Usuario.find(query)
            .select('nombre apellido email estadisticas_evaluacion id_area_trabajo id_cargo')
            .populate('id_area_trabajo', 'nombre')
            .populate('id_cargo', 'nombre')
            .sort({ 'estadisticas_evaluacion.promedio_general': -1 })
            .limit(limite);

        return usuarios.map((usuario, index) => ({
            posicion: index + 1,
            id: usuario._id,
            nombre: `${usuario.nombre} ${usuario.apellido}`,
            email: usuario.email,
            area: usuario.id_area_trabajo?.nombre,
            cargo: usuario.id_cargo?.nombre,
            promedio_general: usuario.estadisticas_evaluacion?.promedio_general || 0,
            total_evaluaciones: usuario.estadisticas_evaluacion?.total_evaluaciones || 0,
            ultimo_calculo: usuario.estadisticas_evaluacion?.ultimo_calculo
        }));
    } catch (error) {
        throw new Error("Error al obtener ranking: " + error.message);
    }
}

/**
 * Recalcula las estadísticas de todos los usuarios
 * @returns {Object} Resumen de la actualización
 */
export async function recalcularTodasLasEstadisticas() {
    try {
        const usuarios = await Usuario.find();
        let actualizados = 0;
        let errores = 0;

        for (const usuario of usuarios) {
            try {
                await calcularYActualizarEstadisticas(usuario._id);
                actualizados++;
            } catch (error) {
                console.error(`Error al actualizar usuario ${usuario._id}:`, error.message);
                errores++;
            }
        }

        return {
            total_usuarios: usuarios.length,
            actualizados,
            errores,
            fecha_actualizacion: new Date()
        };
    } catch (error) {
        throw new Error("Error al recalcular todas las estadísticas: " + error.message);
    }
}
