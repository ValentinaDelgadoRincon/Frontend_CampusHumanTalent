import { Usuario, RespuestaEncuesta, CicloEvaluacion } from "../validationSchemas.js";
import mongoose from 'mongoose';


export async function calcularYActualizarEstadisticas(id_usuario) {
    try {

        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }


        const evaluaciones = await RespuestaEncuesta.find({ 
            id_usuario_evaluado: id_usuario 
        })
        .populate('id_ciclo')
        .populate({
            path: 'respuestas.id_pregunta',
            populate: {
                path: 'id_tipo_pregunta'
            }
        });

        if (evaluaciones.length === 0) {

            usuario.estadisticas_evaluacion = {
                promedio_actitud: 0,
                promedio_aptitud: 0,
                total_evaluaciones: 0,
                ultimo_calculo: new Date(),
                evaluaciones_por_ciclo: []
            };
            await usuario.save();
            return usuario.estadisticas_evaluacion;
        }

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

        const evaluacionesPorCicloArray = [];
        let sumaActitudCiclos = 0;
        let sumaAptitudCiclos = 0;
        let totalCiclos = 0;

        for (const cicloId in evaluacionesPorCiclo) {
            const cicloData = evaluacionesPorCiclo[cicloId];
            const evaluacionesCiclo = cicloData.evaluaciones;


            let totalActitud = 0;
            let countActitud = 0;
            let maxActitud = 0;
            
            let totalAptitud = 0;
            let countAptitud = 0;
            let maxAptitud = 0;

            evaluacionesCiclo.forEach(evaluacion => {
                evaluacion.respuestas.forEach(respuesta => {
                    if (respuesta.id_pregunta && respuesta.id_pregunta.id_tipo_pregunta) {
                        const tipoPregunta = respuesta.id_pregunta.id_tipo_pregunta.nombre;
                        const valorNumerico = respuesta.valor_numerico || 0;
                        
                        const tipoRespuesta = respuesta.id_pregunta.id_tipo_respuesta?.nombre;
                        let maxPosible = 1; 
                        if (tipoRespuesta === 'Escala de Likert') {
                            maxPosible = 5;
                        }

                        if (tipoPregunta === 'Actitud') {
                            totalActitud += valorNumerico;
                            maxActitud += maxPosible;
                            countActitud++;
                        } else if (tipoPregunta === 'Aptitud') {
                            totalAptitud += valorNumerico;
                            maxAptitud += maxPosible;
                            countAptitud++;
                        }
                    }
                });
            });

            const promedioActitudCiclo = maxActitud > 0 
                ? Math.round((totalActitud / maxActitud) * 100) / 10 
                : 0;

            const promedioAptitudCiclo = maxAptitud > 0 
                ? Math.round((totalAptitud / maxAptitud) * 100) / 10 
                : 0;

            evaluacionesPorCicloArray.push({
                id_ciclo: cicloData.id_ciclo,
                promedio_actitud_ciclo: promedioActitudCiclo,
                promedio_aptitud_ciclo: promedioAptitudCiclo,
                total_respuestas: evaluacionesCiclo.length,
                fecha_calculo: new Date()
            });

            sumaActitudCiclos += promedioActitudCiclo;
            sumaAptitudCiclos += promedioAptitudCiclo;
            totalCiclos++;
        }

        const promedioActitudGeneral = totalCiclos > 0 
            ? Math.round(sumaActitudCiclos / totalCiclos) 
            : 0;

        const promedioAptitudGeneral = totalCiclos > 0 
            ? Math.round(sumaAptitudCiclos / totalCiclos) 
            : 0;

        usuario.estadisticas_evaluacion = {
            promedio_actitud: promedioActitudGeneral,
            promedio_aptitud: promedioAptitudGeneral,
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

        if (recalcular || !usuario.estadisticas_evaluacion.ultimo_calculo) {
            await calcularYActualizarEstadisticas(id_usuario);

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

export async function obtenerEstadisticasPorCiclo(id_usuario, id_ciclo) {
    try {

        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }


        const ciclo = await CicloEvaluacion.findById(id_ciclo);
        if (!ciclo) {
            throw new Error("Ciclo no encontrado");
        }


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
                promedio_actitud: 0,
                promedio_aptitud: 0,
                evaluaciones: []
            };
        }

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
                    
                    const tipoRespuesta = respuesta.id_pregunta.id_tipo_respuesta?.nombre;
                    if (tipoRespuesta === 'Si o No') {
                        estadisticasPorTipo[tipoPregunta].maximo_posible += 1;
                    } else if (tipoRespuesta === 'Escala de Likert') {
                        estadisticasPorTipo[tipoPregunta].maximo_posible += 5;
                    }
                }
            });
        });

        const promedioActitud = estadisticasPorTipo['Actitud'] 
            ? Math.round((estadisticasPorTipo['Actitud'].suma / estadisticasPorTipo['Actitud'].maximo_posible) * 100) / 10
            : 0;

        const promedioAptitud = estadisticasPorTipo['Aptitud'] 
            ? Math.round((estadisticasPorTipo['Aptitud'].suma / estadisticasPorTipo['Aptitud'].maximo_posible) * 100) / 10
            : 0;

        const promediosPorTipo = {
            Actitud: {
                promedio_normalizado: promedioActitud,
                total_preguntas: estadisticasPorTipo['Actitud']?.cantidad || 0
            },
            Aptitud: {
                promedio_normalizado: promedioAptitud,
                total_preguntas: estadisticasPorTipo['Aptitud']?.cantidad || 0
            }
        };

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
            promedio_actitud: promedioActitud,
            promedio_aptitud: promedioAptitud,
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

export async function obtenerRankingUsuarios(filtros = {}, limite = 10) {
    try {
        const query = { id_estado: filtros.id_estado };

        if (filtros.id_area_trabajo) {
            query.id_area_trabajo = filtros.id_area_trabajo;
        }

        if (filtros.id_cargo) {
            query.id_cargo = filtros.id_cargo;
        }

        const tipoOrden = filtros.tipo === 'aptitud' 
            ? 'estadisticas_evaluacion.promedio_aptitud' 
            : 'estadisticas_evaluacion.promedio_actitud';

        const usuarios = await Usuario.find(query)
            .select('nombre apellido email estadisticas_evaluacion id_area_trabajo id_cargo')
            .populate('id_area_trabajo', 'nombre')
            .populate('id_cargo', 'nombre')
            .sort({ [tipoOrden]: -1 })
            .limit(limite);

        return usuarios.map((usuario, index) => ({
            posicion: index + 1,
            id: usuario._id,
            nombre: `${usuario.nombre} ${usuario.apellido}`,
            email: usuario.email,
            area: usuario.id_area_trabajo?.nombre,
            cargo: usuario.id_cargo?.nombre,
            promedio_actitud: usuario.estadisticas_evaluacion?.promedio_actitud || 0,
            promedio_aptitud: usuario.estadisticas_evaluacion?.promedio_aptitud || 0,
            total_evaluaciones: usuario.estadisticas_evaluacion?.total_evaluaciones || 0,
            ultimo_calculo: usuario.estadisticas_evaluacion?.ultimo_calculo
        }));
    } catch (error) {
        throw new Error("Error al obtener ranking: " + error.message);
    }
}

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

export async function obtenerPromediosPorArea(filtros = {}) {
    try {
        const query = {};

        if (filtros.id_estado) {
            query.id_estado = filtros.id_estado;
        }

        const usuarios = await Usuario.find(query)
            .select('nombre apellido id_area_trabajo estadisticas_evaluacion')
            .populate('id_area_trabajo', 'nombre');

        const areaMap = {};
        
        usuarios.forEach(usuario => {
            if (!usuario.id_area_trabajo) return;

            const areaId = usuario.id_area_trabajo._id.toString();
            const areaNombre = usuario.id_area_trabajo.nombre;

            if (!areaMap[areaId]) {
                areaMap[areaId] = {
                    id_area: usuario.id_area_trabajo._id,
                    nombre_area: areaNombre,
                    suma_actitud: 0,
                    suma_aptitud: 0,
                    total_usuarios: 0,
                    usuarios_con_evaluaciones: 0
                };
            }

            if (usuario.estadisticas_evaluacion?.total_evaluaciones > 0) {
                areaMap[areaId].suma_actitud += usuario.estadisticas_evaluacion.promedio_actitud || 0;
                areaMap[areaId].suma_aptitud += usuario.estadisticas_evaluacion.promedio_aptitud || 0;
                areaMap[areaId].usuarios_con_evaluaciones++;
            }
            
            areaMap[areaId].total_usuarios++;
        });

        const promediosPorArea = Object.values(areaMap).map(area => {
            const promedioActitud = area.usuarios_con_evaluaciones > 0
                ? (area.suma_actitud / area.usuarios_con_evaluaciones).toFixed(1)
                : 0;

            const promedioAptitud = area.usuarios_con_evaluaciones > 0
                ? (area.suma_aptitud / area.usuarios_con_evaluaciones).toFixed(1)
                : 0;

            return {
                id_area: area.id_area,
                nombre_area: area.nombre_area,
                promedio_actitud: parseFloat(promedioActitud),
                promedio_aptitud: parseFloat(promedioAptitud),
                total_usuarios: area.total_usuarios,
                usuarios_evaluados: area.usuarios_con_evaluaciones
            };
        });

        promediosPorArea.sort((a, b) => a.nombre_area.localeCompare(b.nombre_area));

        return promediosPorArea;
    } catch (error) {
        throw new Error("Error al obtener promedios por área: " + error.message);
    }
}
