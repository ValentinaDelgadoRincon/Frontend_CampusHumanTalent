import * as estadisticasService from "../services/estadisticas.services.js";

/**
 * Obtiene las estadísticas de evaluación de un usuario
 * GET /estadisticas/usuario/:id
 * Query params: recalcular=true/false
 */
export async function obtenerEstadisticasUsuario(req, res) {
    try {
        const { id } = req.params;
        const recalcular = req.query.recalcular === 'true';

        const usuario = await estadisticasService.obtenerEstadisticasUsuario(id, recalcular);

        res.status(200).json({
            success: true,
            data: {
                id: usuario._id,
                nombre: `${usuario.nombre} ${usuario.apellido}`,
                email: usuario.email,
                area: usuario.id_area_trabajo,
                cargo: usuario.id_cargo,
                estadisticas: usuario.estadisticas_evaluacion
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Obtiene estadísticas detalladas de un usuario en un ciclo específico
 * GET /estadisticas/usuario/:id/ciclo/:id_ciclo
 */
export async function obtenerEstadisticasPorCiclo(req, res) {
    try {
        const { id, id_ciclo } = req.params;

        const estadisticas = await estadisticasService.obtenerEstadisticasPorCiclo(id, id_ciclo);

        res.status(200).json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Calcula y actualiza las estadísticas de un usuario
 * POST /estadisticas/usuario/:id/calcular
 */
export async function calcularEstadisticas(req, res) {
    try {
        const { id } = req.params;

        const estadisticas = await estadisticasService.calcularYActualizarEstadisticas(id);

        res.status(200).json({
            success: true,
            message: "Estadísticas calculadas exitosamente",
            data: estadisticas
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Obtiene el ranking de usuarios por promedio general
 * GET /estadisticas/ranking
 * Query params: id_area_trabajo, id_cargo, limite
 */
export async function obtenerRanking(req, res) {
    try {
        const filtros = {};

        if (req.query.id_area_trabajo) {
            filtros.id_area_trabajo = req.query.id_area_trabajo;
        }

        if (req.query.id_cargo) {
            filtros.id_cargo = req.query.id_cargo;
        }

        if (req.query.id_estado) {
            filtros.id_estado = req.query.id_estado;
        }

        const limite = parseInt(req.query.limite) || 10;

        const ranking = await estadisticasService.obtenerRankingUsuarios(filtros, limite);

        res.status(200).json({
            success: true,
            data: ranking,
            total: ranking.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Recalcula las estadísticas de todos los usuarios
 * POST /estadisticas/recalcular-todas
 */
export async function recalcularTodasEstadisticas(req, res) {
    try {
        const resultado = await estadisticasService.recalcularTodasLasEstadisticas();

        res.status(200).json({
            success: true,
            message: "Estadísticas recalculadas exitosamente",
            data: resultado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export async function obtenerPromediosPorArea(req, res) {
    try {
        const filtros = {};

        if (req.query.id_estado) {
            filtros.id_estado = req.query.id_estado;
        }

        const promedios = await estadisticasService.obtenerPromediosPorArea(filtros);

        res.status(200).json({
            success: true,
            data: promedios,
            total_areas: promedios.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
