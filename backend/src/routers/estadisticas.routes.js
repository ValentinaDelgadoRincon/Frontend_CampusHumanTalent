import { Router } from 'express';
import * as estadisticasController from '../controllers/estadisticas.controller.js';

const router = Router();

router.get('/usuario/:id', estadisticasController.obtenerEstadisticasUsuario);

router.get('/usuario/:id/ciclo/:id_ciclo', estadisticasController.obtenerEstadisticasPorCiclo);

router.post('/usuario/:id/calcular', estadisticasController.calcularEstadisticas);

router.get('/ranking', estadisticasController.obtenerRanking);

router.post('/recalcular-todas', estadisticasController.recalcularTodasEstadisticas);

export default router;
